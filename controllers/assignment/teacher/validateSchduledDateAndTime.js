const DateDiff = require('date-diff');

const ValidateScheduledDateAndTime = (dateAndTime) => {

      return new Promise(async (resolve, reject) => {

            try {

                  /**  Add +530 to today date and time and 0 minutes to just convert it into minutes & Format them to get date out of it*/
                  let formatScheduledDate = new Date(new Date(dateAndTime).setMinutes(new Date(dateAndTime).getMinutes()))
                  let formatCurrentDate = new Date(new Date().setMinutes(new Date().getMinutes()))

                  console.log(formatScheduledDate + " ---  " + formatCurrentDate);

                  /** Find the difference b/w scheduled date and timestamp now*/
                  let diff = new DateDiff(new Date(formatScheduledDate), new Date(formatCurrentDate));

                  /** Floor the value you got to know days in numbers i.e 0.8 - 0  */
                  let checkDate = Math.floor(diff.minutes());

                  console.log("checkDate" + checkDate);

                  if (checkDate > 0) {
                        resolve(1) // done
                  } else {
                        resolve(0) // Please choose future dates for scheduling
                  }

            } catch (error) {
                  console.log(error);
                  reject(0) //Something went wrong
            }

      })

}

module.exports = ValidateScheduledDateAndTime;