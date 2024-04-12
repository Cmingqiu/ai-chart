export default {
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
        this.$refs.chapterVideoRef.changeVideoSrc(this.chapterInfo.resourceUrl);
      }
    });
  }
};
