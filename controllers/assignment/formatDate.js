const format = (date) => {

      return new Promise((resolve, reject) => {

            try {

                  console.log("date" +  date);

                  let month = (date.getUTCMonth() + 1) < 10 ? "0" + String(date.getUTCMonth() + 1) : date.getUTCMonth() + 1;

                  let day = date.getDate() < 10 ? "0" + String(date.getDate()) : date.getDate();

                  let formattedDate = new Date(date.getFullYear() + '-' + month + '-' + day + 'T00:00:00.000Z');

                  resolve(formattedDate);

            } catch (error) {
                  reject(0);
            }

      })

}

module.exports = format;