var DBHandler = {
  addUser: function (userid, name, phoneno, gender, email, speaking_level, pronunciation_level, remained_class) {
    var date = new Date().yyyymmdd()
    var user = {
      name: name,
      phoneno: phoneno,
      gender: gender,
      email: email,
      speaking_level: speaking_level,
      pronunciation_level: pronunciation_level,
      registered_date: date,
      remained_class: remained_class,
    }

    var userRef = firebase.database().ref('/user/' + userid)
    userRef.update(user)

    firebase.database().ref('/user/' + userid).on('value', function (snapshot) {
      console.log(snapshot.val())
    })
  },

  addClass2: function (date) {
    var newPushKey = firebase.database().ref().child('class').push().key
    var update = {}
    update['/class/' + newPushKey] = date
    return firebase.database().ref().update(update)
  },
  addClass: function (classDate) {
    var classRef = firebase.database().ref().child('class/')
    var update = {}
    update[date] = 0
    return classRef.update(update)
  },

  addClassEnroll: function (userid, count) {
    var classRef = firebase.database().ref().child('class_enroll_count/' + userid)
    classRef.once('value', function (snapshot) {
      console.log(snapshot.numChildren())
      if (snapshot.exists()) {
        update.count += snapshot.val().count
      }
      return classRef.update(update)
    })

    var date = new Date().yyyymmdd()
    var update = {
      count: count,
      date: date
    }
  },

  isPasswordMatched: function (id, password, deferred) {
    firebase.database().ref().child('password/' + id).once('value', function (snapshot) {
      console.log(snapshot.val())
      if (snapshot.val() == password)
        deferred.resolve('Welcome ' + name + '!')
      else deferred.reject('Wrong credentials.')

      return false
    })
  },
  isVersionMatched: function (version, done) {
    firebase.database().ref().child('/version/').once('value', function (snapshot) {
      console.log(snapshot.val())
      if (snapshot.val() == version)
        done(true)
      else done(false)
    })
  },
  isUserValid: function (userid, done) {
    firebase.database().ref().child('/user/' + userid).once('value', function (snapshot) {
      if (snapshot.exists()) {
        done(snapshot.val().valid)
      }
      else done(GLOBALS.USER_NONE)
    })
  },
  addShopItem: function (name, price) {
    var newPushKey = firebase.database().ref().child('shop_item').push().key
    var update = {}
    update['/shop_item/' + newPushKey] = {
      name: name,
      price: price
    }
    return firebase.database().ref().update(update)
  },

  addShopItem2: function (name, price, standard) {
    var ref = firebase.database().ref('shop_item')
    var update = {}
    update[name] = {
      standard: standard,
      price: price
    }
    return ref.update(update)
  },

  getPriceOfShopItem: function (name) {
    var ref = firebase.database().ref().child('shop_item')
    ref.orderByChild('name').equalTo(name).on('child_added', function (snapshot) {
      console.log(snapshot.val().price)
    })
  },

  addStudyItem2: function (studyid, name) {
    var update = {}
    update['/study_item/' + studyid] = name
    return firebase.database().ref().update(update)
  },

  rateStudyItem2: function (userid, name, rate) {
    var ref = firebase.database().ref().child('study_item')
    ref.orderByChild('name').equalTo(name).on('child_added', function (snapshot) {
      var study_result = firebase.database().ref().child('/study_result/')
      var update = {}
      update[userid + '/' + snapshot.key] = {
        rate: rate
      }
      study_result.update(update)
    })
  },

  rateStudyItem: function (userid, name, rate) {
    var ref = firebase.database().ref().child('/study_result/' + userid)

    ref.orderByChild('name').equalTo(name).on('child_added', function (snapshot) {
      var study_result = firebase.database().ref().child('/study_result/')
      var update = {}
      update[userid + '/' + snapshot.key] = {
        rate: rate
      }
      study_result.update(update)
    })
  },

  buyItem: function (userid, classid, shop_item_name, purchased_count, done) {
    var ref = firebase.database().ref().child('/study_activity/' + userid + '/' + classid + '/shop_item/' + shop_item_name)
    ref.once('value', function (snapshot) {
      if (snapshot.exists()) {
        console.log(snapshot.val())
        purchased_count += snapshot.val()
      }
      return ref.set(purchased_count, done)
    })
  },

  participateInClass: function (userid, classid, isParticipate, done) {
    var ref = firebase.database().ref().child('/study_activity/')
    var listRef = firebase.database().ref('/class_participant/' + classid + '/')
    var userRef = firebase.database().ref('/user/' + userid + '/remained_class/')
    var update = {}
    if (isParticipate) {
      update[userid + '/' + classid + '/class_participation/'] = 1
      var item = {
        name: GLOBALS.MyProfile.name,
        gender: GLOBALS.MyProfile.gender,
        speaking_level: GLOBALS.MyProfile.speaking_level,
        pronunciation_level: GLOBALS.MyProfile.pronunciation_level,
        rate_failed: GLOBALS.MyProfile.rate_failed == undefined ? 0 : GLOBALS.MyProfile.rate_failed,
        rate_passed: GLOBALS.MyProfile.rate_passed == undefined ? 0 : GLOBALS.MyProfile.rate_passed
      }
      listRef.child(userid).update(item)
      userRef.once('value', function (snapshot) {
        if (snapshot.exists()) {
          var remained_class = snapshot.val()
          userRef.set(--remained_class, done)
          ref.child(userid + '/' + classid).update({remained_class: remained_class})
        }
      })
    } else {
      update[userid + '/' + classid + '/class_participation/'] = 0
      listRef.child(userid).remove()
      userRef.once('value', function (snapshot) {
        if (snapshot.exists()) {
          var remained_class = snapshot.val()
          userRef.set(++remained_class, done)
          ref.child(userid + '/' + classid).update({remained_class: remained_class})
        }
      })
    }
    return ref.update(update)
  },

  participateInClassToday: function (userid, isParticipate, done) {
    this.participateInClass(userid, new Date().yyyymmdd(), isParticipate, done)
  },

  participateInPhoneTalk: function (userid, classid, isParticipate, time, duration, done) {
    var ref = firebase.database().ref().child('/study_activity/')
    var listRef = firebase.database().ref('/phonetalk_participant/' + classid + '/')
    var update = {}
    if (isParticipate) {
      update[userid + '/' + classid + '/phonetalk_participation/'] = 1
      var item = {
        name: GLOBALS.MyProfile.name,
        level: GLOBALS.MyProfile.speaking_level,
        time: time,
        duration: duration
      }
      listRef.child(userid).update(item)
    } else {
      update[userid + '/' + classid + '/phonetalk_participation/'] = 0
      listRef.child(userid).remove()
    }
    return ref.update(update, done)
  },

  participateInPhoneTalkToday: function (userid, isParticipate, time, duration, done) {
    this.participateInPhoneTalk(userid, new Date().yyyymmdd(), isParticipate, time, duration, done)
  },

  getPhoneTalkInfoToday: function (userid, done) {
    firebase.database().ref('/phonetalk_participant/' + new Date().yyyymmdd() + '/' + userid).once('value', function (snapshot) {
      done(snapshot.val())
    })
  },

  getStudyItems: function (ret) {
    var ref = firebase.database().ref().child('/study_item/')
    ref.once('value', function (allMessagesSnapshot) {
      var retVal = [ ]

      allMessagesSnapshot.forEach(function (messageSnapshot) {
        // Will be called with a messageSnapshot for each child under the /messages/ node
        retVal.push(messageSnapshot.val())
      })
      ret(retVal)
    })
  },
  getStudyResult: function (userid, done) {
    var ref = firebase.database().ref().child('/study_result/' + userid)
    ref.once('value', function (allMessagesSnapshot) {
      var retVal = [ ]

      allMessagesSnapshot.forEach(function (messageSnapshot) {
        // Will be called with a messageSnapshot for each child under the /messages/ node
        var today = new Date()

        var val = {
          name: messageSnapshot.val().name,
          result: messageSnapshot.val().result,
          date: messageSnapshot.val().date
        }
        if (val.result == GLOBALS.RATE_PASSED) { // Passed
          var reviewedDate = new Date(messageSnapshot.val().date)
          reviewedDate.setDate(reviewedDate.getDate() + 15)

          if (today < reviewedDate)
            val.path = 'img/pass.png'
          else val.path = 'img/passp.png'
        }
        else if (val.result == GLOBALS.RATE_FAILED) // Failed
          val.path = 'img/fail.png'

        retVal.push(val)
      })
      if (done != null)
        done(retVal)
    })
  },
  getStudyResultCount: function (userid, done) {
    var ref = firebase.database().ref().child('/study_result/' + userid)
    var pass = 0, pass_15days = 0, fail = 0, unreview = 0
    ref.once('value', function (allMessagesSnapshot) {
      allMessagesSnapshot.forEach(function (messageSnapshot) {
        var today = new Date()
        var result = messageSnapshot.val().result

        if (result == GLOBALS.RATE_PASSED) { // Passed
          var reviewedDate = new Date(messageSnapshot.val().date)
          reviewedDate.setDate(reviewedDate.getDate() + 15)

          if (today < reviewedDate)
            pass++
          else pass_15days++
        }
        else if (result == GLOBALS.RATE_FAILED) // Failed
          fail++
        else if (result == GLOBALS.RATE_UNREVIEWED)
          unreview++
      })
      if (done != null)
        done(pass, pass_15days, fail, unreview)
    })
  },
  updateUserStudyResultStat: function (userid) {
    this.getStudyResultCount(userid, function (pass, pass_15days, fail, unreview) {
      var userRef = firebase.database().ref().child('/user/' + userid)
      var update = {
        rate_passed: pass + pass_15days,
        rate_failed: fail,
        rate_unreviewed: unreview
      }
      userRef.update(update)
    })
  },

  getUserInfo: function (userid, done) {
    var ref = firebase.database().ref().child('/user/' + userid)
    ref.once('value', function (dataSnapshop) {
      if (dataSnapshop.exists()) {
        console.log(dataSnapshop.val())
        GLOBALS.MyProfile.userid = userid
        GLOBALS.MyProfile.email = dataSnapshop.email
        GLOBALS.MyProfile.gender = dataSnapshop.val().gender
        GLOBALS.MyProfile.name = dataSnapshop.val().name
        GLOBALS.MyProfile.phoneno = dataSnapshop.val().phoneno
        GLOBALS.MyProfile.speaking_level = dataSnapshop.val().speaking_level
        GLOBALS.MyProfile.pronunciation_level = dataSnapshop.val().pronunciation_level
        GLOBALS.MyProfile.email = dataSnapshop.val().email
        GLOBALS.MyProfile.remained_purchase = dataSnapshop.val().remained_purchase
        GLOBALS.MyProfile.remained_class = dataSnapshop.val().remained_class
        GLOBALS.MyProfile.device_type = dataSnapshop.val().device_type
        GLOBALS.MyProfile.rate_failed = dataSnapshop.val().rate_failed
        GLOBALS.MyProfile.rate_passed = dataSnapshop.val().rate_passed
      }
      if (done != null)
        done()
    })
  },
  getUserInfo2: function (userid, done) {
    var ref = firebase.database().ref().child('/user/' + userid)
    ref.once('value', function (dataSnapshop) {
      var user = {}
      if (dataSnapshop.exists()) {
        console.log(dataSnapshop.val())
        user.userid = userid
        user.email = dataSnapshop.email
        user.gender = dataSnapshop.val().gender
        user.name = dataSnapshop.val().name
        user.phoneno = dataSnapshop.val().phoneno
        user.speaking_level = dataSnapshop.val().speaking_level
        user.pronunciation_level = dataSnapshop.val().pronunciation_level
        user.email = dataSnapshop.val().email
        user.remained_purchase = dataSnapshop.val().remained_purchase
        user.remained_class = dataSnapshop.val().remained_class
      }
      if (done != null)
        done(user)
    })
  },
  setStudyResultItem: function (userid, studyid, name) {
    var update = {}
    update['/study_result/' + userid + '/' + studyid] = {
      name: name,
      result: 0,
      date: new Date().toDateString()
    }
    return firebase.database().ref().update(update)
  },
  setStudyResultItems: function (userid) {
    var study_items = ['시제', '완료', '조동사', 'To부정사', '동명사', '수동태', '전치사', '관계대명사',
      '접속사', '부사', '형용사', '가정법', '비교급', '수량', '비인칭 주어', '가족', '애완동물', '도둑/강도',
      '스포츠', '레저/취미', '패션', '로또', '여행', '맛집', '꿈', '미드', '친구', '북한', '결혼', '연애']
    for (var i in study_items) {
      this.setStudyResultItem(userid, i, study_items[i])
    }
  },
  setStudyResult: function (userid, name, result, done) {
    var ref = firebase.database().ref('/study_result/' + userid)
    ref.orderByChild('name').equalTo(name).on('child_added', function (snapshot) {
      console.log(snapshot.key)
      console.log(snapshot.val().result)
      var update = {}
      update['/study_result/' + userid + '/' + snapshot.key] = {
        result: result,
        date: new Date().toDateString(),
        name: snapshot.val().name
      }
      /*var update = {
          result : result,
          date : new Date().toDateString(),
          name : snapshot.val().name
      }*/
      firebase.database().ref().update(update, function () {
        if (done != null)
          done()
      })
    })
  },
  LoadPasswordList: function () {
    var ref = firebase.database().ref().child('/password/')
    ref.once('value', function (allMSnapshot) {
      allMSnapshot.forEach(function (snapshot) {
        var password = {
          key: snapshot.key,
          password: snapshot.val()
        }
        console.log(password)
        GLOBALS.Password.push(password)
      })
    })
  },
  rateLevel: function (userid, type, level, done) {
    var ref = firebase.database().ref().child('/user/' + userid)
    var levelRef = {}
    if (type == 0) {
      levelRef = ref.child('speaking_level')
    } else {
      levelRef = ref.child('pronunciation_level')
    }
    return levelRef.set(level, done)
  },
  addTotalPurchaseCost: function (userid, purchased_cost, done) {
    var ref = firebase.database().ref().child('/user/' + userid + '/remained_purchase/')
    ref.once('value', function (snapshot) {
      if (snapshot.exists()) {
        purchased_cost += snapshot.val()
      }
      return ref.set(purchased_cost, done)
    })
  },

  addClassPurchaseCost: function (userid, classid, purchased_cost, done) {
    var ref = firebase.database().ref().child('/study_activity/' + userid + '/' + classid + '/purchase_cost/')
    ref.once('value', function (snapshot) {
      if (snapshot.exists()) {
        purchased_cost += snapshot.val()
      }
      return ref.set(purchased_cost, done)
    })
  },

  getShopItems: function (ret) {
    var ref = firebase.database().ref().child('/shop_item/')
    ref.once('value', function (allMessagesSnapshot) {
      var retVal = [ ]

      allMessagesSnapshot.forEach(function (snapshot) {
        var item = {
          name: snapshot.key,
          price: snapshot.val().price,
          standard: snapshot.val().standard
        }
        retVal.push(item)
      })
      ret(retVal)
    })
  },
  getAllAudioList: function (userid, done) {
    firebase.database().ref().child('/recorded_speech/' + userid).once('value', function (allSnapshots) {
      var retVal = new Array();
      allSnapshots.forEach(function (snapshot) {
        var item = {
          filename: snapshot.val().filename,
          url: snapshot.val().url,
        }
        retVal.unshift(item);
      })
      done(retVal);
    });
  },
  getActivityList: function (userid, done, done2) {
    var ref = firebase.database().ref().child('/study_activity/' + userid)
    ref.orderByValue().once('value', function (allSnapshot) {
      var retVal = [ ]
      var isToday = false
      allSnapshot.forEach(function (snapshot) {
        if (snapshot.key == new Date().yyyymmdd())
          isToday = true
        var item = {
          classid: snapshot.key,
          purchase_cost: snapshot.val().purchase_cost === undefined ? 0 : snapshot.val().purchase_cost,
          remained_class: snapshot.val().remained_class,
          class_participation: snapshot.val().class_participation,
          phonetalk_participation: snapshot.val().phonetalk_participation,
          shop_item: [ ],
          class_participation_text: snapshot.val().class_participation === 1 ? '스터디 참여' + ' (' + snapshot.val().remained_class + '회 남음)' : '스터디 불참',
          phonetalk_participation_text: snapshot.val().phonetalk_participation === 1 ? '전화영어 참여' : '전화영어 불참'
        }
        var itemRef = ref.child(snapshot.key + '/shop_item/')
        itemRef.orderByValue().once('value', function (shop_snapshot) {
          shop_snapshot.forEach(function (shop_snapshot) {
            item.shop_item.push({
              name: shop_snapshot.key,
              count: shop_snapshot.val()
            })
          // console.log("아이템 : " + shop_snapshot.key)
          // console.log("카운트 : " + shop_snapshot.val())
          })
          if (done2 !== null)
            done2(retVal)
        })
        // console.log(item)
        retVal.unshift(item)
      })
      if (done != null) {
        if (isToday == false) {
          var today = {
            classid: new Date().yyyymmdd(),
            purchase_cost: 0,
            class_participation: -1,
            phonetalk_participation: -1,
            shop_item: [ ]
          }
          retVal.unshift(today)
        }
        done(retVal)
      }
    })
  },
  createTodayClass: function (userid, done) {
    var ref = firebase.database().ref().child('/study_activity/' + userid + '/' + new Date().yyyymmdd())
    ref.orderByValue().once('value', function (snapshot) {
      if (!snapshot.exists()) {
        var update = {
          class_participation: 0,
          phonetalk_participation: 0
        }
        ref.update(update, done)
      }
    })
  },
  saveDeviceToken: function (userid, token, device_type) {
    if (token != undefined) {
      var userRef = firebase.database().ref('/user/' + userid)
      userRef.update(token)
      userRef.update({device_type: device_type})
    }
  },
  retrieveAllUserList: function (done) {
    var ref = firebase.database().ref().child('/user/')
    ref.once('value', function (allUserSnapshop) {
      var retVal = [ ]
      allUserSnapshop.forEach(function (snapshot) {
        // Will be called with a messageSnapshot for each child under the /messages/ node
        console.log(snapshot.val())
        var user = {
          userid: snapshot.key,
          gender: snapshot.val().gender == 0 ? 'img/male.png' : 'img/female.png',
          name: snapshot.val().name,
          speaking_level: snapshot.val().speaking_level,
          pronunciation_level: snapshot.val().pronunciation_level,
          rate_passed: snapshot.val().rate_passed == undefined ? 0 : snapshot.val().rate_passed,
          rate_failed: snapshot.val().rate_failed == undefined ? 0 : snapshot.val().rate_failed,
        }
        retVal.push(user)
      })
      if (done != null)
        done(retVal)
    })
  },
  getClassParticipants: function (classid, done) {
    var ref = firebase.database().ref().child('/class_participant/' + classid)
    ref.once('value', function (allUserSnapshop) {
      var retVal = [ ]
      allUserSnapshop.forEach(function (snapshot) {
        console.log(snapshot.val())
        var user = {
          userid: snapshot.key,
          gender: snapshot.val().gender == 0 ? 'img/male.png' : 'img/female.png',
          name: snapshot.val().name,
          speaking_level: snapshot.val().speaking_level,
          pronunciation_level: snapshot.val().pronunciation_level,
          rate_passed: snapshot.val().rate_passed == undefined ? 0 : snapshot.val().rate_passed,
          rate_failed: snapshot.val().rate_failed == undefined ? 0 : snapshot.val().rate_failed,
        }
        retVal.push(user)
      })
      if (done != null)
        done(retVal)
    })
  },
  isChangableTime: function () {
    now = new Date()
    if ((now.getHours() == 19 && now.getMinutes() >= 30) || (now.getHours() > 20 && now.getHour()) < 0)
      return false
    else return true
  }
}