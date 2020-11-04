const duplicates = (listData) => {

      return new Promise((resolve, reject) => {

            if (listData) {

                  let Duplicates = listData.filter((item, index) => listData.indexOf(item) != index)

                  resolve(Duplicates)

            } else {
                  reject(0);
            }

      })

}

module.exports = duplicates