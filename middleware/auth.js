const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

       if (req.headers.authorization) {

              const token = req.headers.authorization.split(" ")[1];

              if (token) {

                     try {
                            const decoded = jwt.verify(token, process.env.JWT_SECRET);
                            req.userData = decoded;
                            console.log(req.userData);
                            next();
                     } catch (error) {
                            //console.log(error);
                            res.status(401).json({
                                   statusCode: 0,
                                   message: 'AUTH FAILED....!!' // change to access Denied..!!
                            })
                     }

              } else {

                     res.status(401).json({
                            statusCode: 0,
                            message: 'AUTH FAILED....!!' // change to access Denied..!!
                     })

              }

       } else {

              res.status(401).json({
                     statusCode: 0,
                     message: 'AUTH FAILED....!!' // change to access Denied..!!
              })

       }
};