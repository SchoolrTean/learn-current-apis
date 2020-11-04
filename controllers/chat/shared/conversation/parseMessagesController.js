module.exports = (messages) => {

      return new Promise((resolve, reject) => {

            try {

                  let messageList = new Array();

                  for (let index = 0; index < messages.length; index++) {

                        const message = messages[index];

                        let messageObj = {
                              _id: message._id,
                              roomId: message.roomId,
                              userId: message.userId._id,
                              userfirstName: message.userId.firstName + " " + message.userId.surName, 

                              // userPic: message.userId.profilePic ? message.userId.profilePic : "",
                              // userActiveStatus: String(message.userId.isActive),

                              seenStatus: message.seenStatus ? String(message.seenStatus) : "false",
                              deleteAllStatus: message.deleteAllStatus ? String(message.deleteAllStatus) : "false",
                              messageType: message.messageType, //1-message 2-leave letter 3-image 4-attachment 5-School Assignment 6-audio
                              message: message.message ? message.message : "",
                              messageUrls: message.urls ? message.urls : [],

                              replyId: "",
                              replyUserId: "",
                              replyuserName: "",
                              replyText: "",
                              replyUrls: [],
                              replyDate: "",
                              schoolId: "",
                              sectionType: "",
                              assignmentDate: "",
                              messageGroup: "MSG"
                        }



                        if (message.replyId) {
                              messageObj.replyId = message.replyId._id
                              messageObj.replyUserId = message.replyUserId._id ? message.replyUserId._id : ""
                              messageObj.replyUserName = message.replyUserId.surName ? message.replyUserId.firstName + " " + message.replyUserId.surName : message.replyUserId.firstName + " "
                              messageObj.replyText = message.replyId.message ? message.replyId.message : ""
                              messageObj.replyUrls = message.replyId.urls ? message.replyId.urls : []
                              messageObj.replyDate = message.replyId.date
                        }

                        if (message.assignmentSchoolId) {
                              messageObj.schoolId = message.assignmentSchoolId._id
                              messageObj.sectionType = message.assignmentSchoolId.sectionType
                              messageObj.assignmentDate = message.assignmentSchoolId.date
                        }

                        messageObj.date = message.date;

                        messageList.push(messageObj);
                  }

                  resolve(messageList)


            } catch (error) {

                  console.log(error);
                  reject('Something Went Wrong...!!!')

            }

      });

}

