<template>
  <div class="course-detail">
    <div class="bread-box">
      <current-position
        :fromRoute="fromRoute"
        :courseInfo="courseInfo"></current-position>
    </div>
    <div class="course-name">{{ this.courseInfo.courseName }}</div>
    <div class="course-detail-content">
      <div class="left-part">
        <div class="lesson-part">
          <div class="resource-part">
            <chapter-video
              ref="chapterVideoRef"
              v-show="chapterInfo.type === VIDEO || chapterInfo.type === AUDIO"
              :cover="courseInfo.cover"
              :resourceUrl="chapterInfo.resourceUrl"
              :videoPlayAdd="videoPlayAdd"
              :courseId="courseId"
              :lessonId="lessonId"
              @play-end="playEnd"></chapter-video>
            <it-reader
              v-show="chapterInfo.type === BOOK"
              :cover="courseInfo.cover"
              :chapterInfo="chapterInfo"
              :catalogList="catalogList"
              :selectLessonId="lessonId"
              @selectChapter="selectChapter"></it-reader>
          </div>
          <div class="info-part">
            <div class="learn-popularity">
              <img class="img-redu" src="../../assets/images/redu.png" />
              <span>{{ courseInfo.learnPopularity }}</span>
              <span>人在学</span>
            </div>
            <div
              class="learn-status-info"
              v-if="!isPurchased"
              @click="courseAddLearn">
              <div class="lesson-price">
                {{ courseInfo.price > 0 ? `￥${courseInfo.price}` : '免费' }}
              </div>
              <div class="status-text">加入学习</div>
            </div>
          </div>
        </div>
        <div class="introduce-part">
          <course-introduce
            :introduction="courseInfo.introduction"></course-introduce>
        </div>
      </div>
      <div class="right-part">
        <div class="catalog-part">
          <course-catalog
            :catalogList="catalogList"
            :selectLessonId="lessonId"
            :coursePrice="courseInfo.price"
            :isPurchased="isPurchased"
            @selectChapter="selectChapter"></course-catalog>
        </div>
        <div class="like-part">
          <guess-like
            trackIdPre="pcweb_xtz_kcbf"
            @changeCourse="changeCourse"></guess-like>
        </div>
      </div>
    </div>

    <!-- 试看结束弹框 / 付费提示弹框 -->
    <Dialog
      :visible.sync="dialogVisible"
      width="320px"
      confirmText="立即购买"
      cancelText="以后再学"
      @confirm="confirmDialog"
      @cancel="closeDialog">
      <div class="warm-tip">
        <div class="warm-tip--title">
          <i class="el-icon-warning"></i>
          {{ dialogTitle }}
        </div>
        <div class="warm-tip--content">{{ dialogContent }}</div>
      </div>
    </Dialog>

    <!-- 支付完成弹框 -->
    <Dialog
      :visible.sync="payDialogVisible"
      width="320px"
      confirmText="支付完成"
      cancelText="支付遇到问题"
      :afterClose="afterPay"
      @confirm="payFinished"
      @cancel="cancelPay"
      @close="closePayDialog">
      <div class="warm-tip">
        <div class="warm-tip--title">
          <i class="el-icon-warning"></i>温馨提示
        </div>
        <div class="warm-tip--content">请您在新打开的页面进行支付！</div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import CurrentPosition from '@/components/common/CurrentPosition.vue';
import CourseIntroduce from '@/components/business/course/CourseIntroduce.vue';
import CourseCatalog from '@/components/business/course/CourseCatalog.vue';
import GuessLike from '@/components/GuessLike.vue';
import ChapterVideo from '@/components/business/course/ChapterVideo.vue';
import ItReader from '@/components/business/course/ItReader.vue';
import Dialog from '@/components/common/Dialog';

import {
  getCourseById,
  isPurchased as isPurchasedApi,
  getCourseCatalog,
  getChapterById,
  addLearn,
  updateLearnInfo,
  getPlayAddr,
  getGoodsInfo,
  handleCreateOrder,
  queryUserCourseRelation
} from '@/api/course';
import {
  courseFromSessionStorage,
  curLessonSessionStorage
} from '@/utils/storage/sessionStorage';
import { TAUtils, LOGIN, debounce } from '@/utils/index';
import { getUserInfo } from '@/api/common';
import { getMyCourseList } from '@/api/mine';

// 试看结束弹框和付费提醒弹框
const MODAL_STATUS_MAP = {
  trialEnd: {
    modalTitle: '试看章节已结束', // 弹框标题
    modalContent: '后续课程为付费内容，须购买后观看', // 弹框内容
    statPrefix: 'pcweb_xtz_kcbfy.end' // 埋点前缀
  },
  charge: {
    modalTitle: '该章节为付费内容', // 弹框标题
    modalContent: '购买后可观看完整课程', // 弹框内容
    statPrefix: 'pcweb_xtz_kcbfy.charge' // 埋点前缀
  }
};

export default {
  name: 'CourseDetail',
  data() {
    return {
      VIDEO: 0, // 课程类型为视频
      AUDIO: 1, // 课程类型为音频
      BOOK: 2, // 课程类型为图文
      courseId: '', // 课程ID
      courseInfo: {}, // 课程信息
      isPurchased: false, // 是否已加入学习/已购买
      catalogList: [], // 课程目录
      lessonId: '', // 当前章节ID
      chapterInfo: {}, // 当前章节信息
      videoPlayAdd: null, // 查询的视频资源地址 /med/video/asset/v1/play_addr
      enterTime: 0,
      lastLearnTime: 0,
      fromRoute: {
        name: 'CourseDetail',
        title: '课程详情',
        query: {
          course_id: this.$route.query.course_id
        }
      },
      dialogVisible: false, // 弹框显示隐藏
      dialogType: 'trialEnd', // 弹框类型： trialEnd-试看章节结束  charge-付费提醒
      payTimer: null, // 资讯支付轮询定时器
      userId: window.snsMobile.getCookie('userid'),
      payDialogVisible: false
    };
  },
  computed: {
    // 弹框标题
    dialogTitle() {
      return MODAL_STATUS_MAP[this.dialogType].modalTitle;
    },
    // 弹框内容
    dialogContent() {
      return MODAL_STATUS_MAP[this.dialogType].modalContent;
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from && from.name) {
        vm.fromRoute = {
          name: from.name,
          title: from.meta.title,
          query: from.query
        };
        courseFromSessionStorage.set(JSON.stringify(vm.fromRoute));
      } else if (courseFromSessionStorage.get()) {
        vm.fromRoute = courseFromSessionStorage.get();
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.chapterInfo.type !== this.BOOK) {
      this.learnTimeTa();
      this.updateLearningWhenLeave();
    }
    next();
  },
  methods: {
    // 课程信息查询
    getCourseDetail() {
      return getCourseById(this.courseId).then(res => {
        this.courseInfo = res.courseInfo;
      });
    },
    // 课程目录查询
    getCatalogList() {
      return getCourseCatalog(this.courseId).then(res => {
        this.catalogList = res.index;
        return res;
      });
    },
    // 判断课程是否已加入学习
    isCourseAdd() {
      return isPurchasedApi(this.courseId).then(res => {
        this.isPurchased = !!res?.isPurchased;
        if (this.isPurchased) {
          this.updateLearning();
        }
      });
    },
    // 章节信息查询
    getChapterInfo() {
      // 未加入学习的课程才需要缓存当前学习章节
      if (!this.isPurchased) {
        curLessonSessionStorage.set(
          `${this.userId}_${this.courseId}_learning_lesson`,
          this.lessonId
        );
      }

      getChapterById(this.lessonId).then(res => {
        this.chapterInfo = res.lessonInfo;
        this.learnTimeTa();
        if (res.lessonInfo.type === 0) {
          // 视频
          getPlayAddr(res.lessonInfo.resourceId)
            .then(addrRes => {
              this.videoPlayAdd = addrRes.play_addr;
              const url = this.videoPlayAdd || this.chapterInfo.resourceUrl;
              this.$refs.chapterVideoRef.changeVideoSrc(url);
            })
            .catch(() => {
              this.videoPlayAdd = '';
              this.$refs.chapterVideoRef.changeVideoSrc(
                this.chapterInfo.resourceUrl
              );
            });
        } else if (res.lessonInfo.type === 1) {
          this.$refs.chapterVideoRef.changeVideoSrc(
            this.chapterInfo.resourceUrl
          );
        }
      });
    },
    // 选择课程触发
    async selectChapter(item) {
      // 判断付费课程是否购买，未购买且非试学章节则弹框
      if (this.courseInfo.price > 0 && !this.isPurchased && !item.isTrial) {
        this.dialogType = 'charge';
        this.dialogVisible = true;
        TAUtils.log({ id: MODAL_STATUS_MAP[this.dialogType].statPrefix });
        return;
      }
      // 切换章节之前，非图文课先上报学习时长
      if (this.chapterInfo.type && this.chapterInfo.type !== this.BOOK) {
        this.updateLearning();
      }

      this.lessonId = item.lessonId;
      this.getChapterInfo();
    },
    // 加入学习
    courseAddLearn() {
      TAUtils.log({
        id: 'pcweb_xtz_kcbf.jrxx',
        course: 'course_' + this.courseId + '_' + this.lessonId
      });
      if (this.courseInfo.price > 0) {
        // 付费课购买后会立即加入学习
        this.buyCourse();
      } else {
        // 免费课直接加入在学
        this.addToMyLearning();
      }
    },
    // 免费课加入我的在学
    addToMyLearning() {
      addLearn(this.courseId).then(res => {
        this.getCourseDetail();
        this.isCourseAdd();
        this.updateOnLearning();
      });
    },
    updateLearning() {
      // 最小上报时长为10s
      const minLearnTime = 10;
      if (this.isPurchased && this.lastLearnTime > minLearnTime) {
        const param = {
          courseId: this.courseId,
          progress: this.$store.state.process,
          lessonId: this.lessonId,
          learnDuration: Number(this.lastLearnTime)
        };
        updateLearnInfo(param).then(() => {
          this.updateSettingTime();
        });
      }
    },
    // 上报学习时长时更新头像悬浮展示的学习时长
    updateSettingTime() {
      setTimeout(() => {
        getUserInfo()
          .then(res => {
            const { learnDuration } = res;
            this.$store.commit('learnTime', learnDuration);
          })
          .catch(_err => {});
      }, 200);
    },
    // 加入学习时更新头像悬浮展示的在学数量
    updateOnLearning() {
      const param = {
        page_num: 1,
        page_size: 20
      };
      getMyCourseList(param).then(res => {
        this.$store.commit('learningCount', res.total);
      });
    },
    // 返回时上报时长
    updateLearningWhenLeave() {
      const minLearnTime = 10;
      if (this.isPurchased && this.lastLearnTime > minLearnTime) {
        const param = {
          courseId: this.courseId,
          lessonId: this.lessonId,
          learnDuration: this.lastLearnTime
        };
        updateLearnInfo(param).then(() => {
          this.updateSettingTime();
        });
      }
    },
    learnTimeTa() {
      if (this.enterTime && this.enterTime !== 0) {
        this.lastLearnTime = (Date.now() / 1000 - this.enterTime).toFixed(0);
        TAUtils.log({
          id: 'pcweb_xtz_kcbf.pcweb_xtz_kcbfy_time',
          course: 'course_' + this.courseId + '_' + this.lessonId,
          learntime: 'learntime_' + this.lastLearnTime
        });
      }
      this.enterTime = Date.now() / 1000;
    },
    changeCourse(course) {
      this.fromRoute = {
        name: 'CourseDetail',
        title: '课程详情',
        query: {
          course_id: this.courseId
        }
      };
      courseFromSessionStorage.set(JSON.stringify(this.fromRoute));
    },
    // 播放结束
    playEnd() {
      // 如果是付费课程，未购买且是试学章节则弹框
      if (
        this.courseInfo.price > 0 &&
        !this.isPurchased &&
        this.chapterInfo.isTrial
      ) {
        this.dialogType = 'trialEnd';
        this.dialogVisible = true;
        TAUtils.log({ id: MODAL_STATUS_MAP[this.dialogType].statPrefix });
      }
    },
    // 购买付费课
    async buyCourse() {
      // 先登录
      if (!window.snsMobile.isLogin()) {
        LOGIN.signIn();
        return;
      }
      // 第一步：查询资讯课程还是小额课程 payType 0-资讯  1-小额
      const goodsInfo = await getGoodsInfo(this.courseId);
      if (goodsInfo.payType === 0) {
        // 资讯支付
        const url = window.location.href;
        // 第二步：创建订单
        const order = await handleCreateOrder({
          courseId: this.courseId,
          redirUrl: url,
          jumpUrl: url
        });
        if (order.order_id) {
          // 第三步：拿到订单id，跳转支付页面
          window.open(
            `https://shop.10jqka.com.cn/app/online/shop/orderConfirm.html?orderid=${order.order_id}`
          );
          // 第四步：打开弹框
          this.payDialogVisible = true;
          TAUtils.log({ id: 'pcweb_xtz_kcbfy.remind' });
        }
      } else if (goodsInfo.payType === 1) {
        // 用来记录来源
        handleCreateOrder({ courseId: this.courseId });
        // 小额支付 系列课程
        const payInstance = new PayInstance({
          // sid: goodsInfo.goodsId,
          acId: goodsInfo.payParam,
          sid: '444',
          zIndex: 9999,
          activity_sign: '埋点'
          /* 该功能小额那边还未发布，需要4月之后
          paySuccessCallback: () => {
            window.location.reload()
          } */
        });
        // 打开支付页
        payInstance.showPage();
        // 第四步：打开弹框
        this.payDialogVisible = true;
        TAUtils.log({ id: 'pcweb_xtz_kcbfy.remind' });
      }
    },
    clearTimer() {
      clearTimeout(this.payTimer);
      this.payTimer = null;
    },
    // 轮询用户是否已购买
    pollUserCourseRelation() {
      const INTERVAL = 2 * 1000;
      this.payTimer = setInterval(async () => {
        try {
          const { purchase } = await queryUserCourseRelation(this.courseId);
          if (purchase === 1) {
            // 已购买
            this.clearTimer();
            window.location.reload();
          }
        } catch (error) {}
      }, INTERVAL);
    },
    confirmDialog() {
      this.dialogVisible = false;
      this.buyCourse();
      TAUtils.log({
        id: `${MODAL_STATUS_MAP[this.dialogType].statPrefix}.buy`
      });
    },
    closeDialog() {
      TAUtils.log({
        id: `${MODAL_STATUS_MAP[this.dialogType].statPrefix}.later`
      });
    },
    // 查询用户是否已购买，购买完成后刷新页面，查询失败或没有权限再查一次
    payFinished() {
      TAUtils.log({
        id: 'pcweb_xtz_kcbfy.remind.done'
      });
      this.payDialogVisible = false;
    },
    fetchRelation() {
      setTimeout(async () => {
        const { purchase } = await queryUserCourseRelation(this.courseId);
        if (purchase === 1) {
          // 已购买
          window.location.reload();
        }
      }, 5 * 1000);
    },
    cancelPay() {
      TAUtils.log({ id: 'pcweb_xtz_kcbfy.remind.bug' });
    },
    closePayDialog() {
      TAUtils.log({ id: 'pcweb_xtz_kcbfy.remind.close' });
    },
    async afterPay() {
      try {
        const { purchase } = await queryUserCourseRelation(this.courseId);
        if (purchase === 1) {
          // 已购买
          window.location.reload();
        } else {
          this.fetchRelation();
        }
      } catch (error) {
        this.fetchRelation();
      }
    },
    // 初始化处理
    init() {
      Promise.all([
        this.getCatalogList(),
        this.getCourseDetail(),
        this.isCourseAdd()
      ]).then(([catalogInfo]) => {
        if (this.lessonId) {
          // 如果是url上带有lessonId，优先级最高
        } else if (!this.isPurchased) {
          // 未加入学习，从缓存中取上次学习章节，没有缓存默认第一节
          const cacheLessonId = curLessonSessionStorage.get(
            `${this.userId}_${this.courseId}_learning_lesson`
          );
          this.lessonId = cacheLessonId || this.catalogList[0]?.lessonId;
        } else {
          // 已加入学习
          this.lessonId = catalogInfo.lastLearn;
        }

        const catalog = this.catalogList.find(
          ({ lessonId }) => lessonId === this.lessonId
        );
        // 更新章节信息
        this.chapterInfo = { ...this.chapterInfo, ...catalog };
        //  查询指定章节信息
        this.selectChapter(catalog);
      });
    }
  },
  mounted() {
    this.enterTime = Date.now() / 1000;
    const { course_id: courseId, lesson_id: lessonId = '' } = this.$route.query;
    this.courseId = courseId;
    this.lessonId = lessonId;

    TAUtils.log({ id: 'pcweb_xtz_kcbf', course: 'course_' + this.courseId });
    if (this.fromRoute?.name === 'CourseDetail') {
      courseFromSessionStorage.set(JSON.stringify(this.fromRoute));
    }
    this.init();
  },
  beforeDestroy() {
    this.clearTimer();
  },
  components: {
    CurrentPosition,
    CourseIntroduce,
    CourseCatalog,
    GuessLike,
    ChapterVideo,
    ItReader,
    Dialog
  }
};
</script>
