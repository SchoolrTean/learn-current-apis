const request = require('request')
const xml2Json = require('xml-js')

/*
     This function recieves mobile no and message as input parameters and send sms. 
*/
exports.send = (mobileNo, message, verificationCode = null) => {

     return new Promise((resolve, reject) => {

          let responseObj = {};

          //Sms gate way Request Call Back Url
          let requestUrl = 'http://107.20.199.106/api/v3/sendsms/plain?user=datasmart&password=R5hCUd7K&sender=SCHOOL&smstext=' + message + '&gsm=91' + mobileNo + '&type=longsms';

          //Callback Request for url and response is received
          request(requestUrl, function (error, response, body) {
               if (error) {
                    console.log(error);
                    // Print the error
                    reject(new Error('Error during sending verification code:'));
               }

               //console.log(response)
               console.log(body)

               //Response received and comparing status code for confirmation
               if (response && response.statusCode == 200) {
                    console.log('Verification Code Send As Sms');

                    //Convert xml data to json and check for response code sent
                    let responseData = xml2Json.xml2json(body, {
                         compact: true,
                         spaces: 4
                    });

                    let data = JSON.parse(responseData);

                    console.log(data.results.result.status);

                    //check response code for final confirmation of sent
                    if (data.results.result.status._text == "0") {

                         console.log("Verification Sent to Mobile No " + mobileNo + "/n message " + message);

                         responseObj.statusCode = "1";
                         responseObj.verificationCode = verificationCode;
                         responseObj.message = "Verification Code sent to registered mobileNo";

                         resolve(responseObj);

                    } else if (data.results.result.status._text == "-3") {

                         responseObj.statusCode = "0";
                         responseObj.message = "Please Enter Valid Mobileno...!!";

                         resolve(responseObj);

                    } else {

                         reject(new Error("Something went wrong.. Please try later...!!"));

                    }

               } else {
                    console.log('Verification Code Sms Failed');

                    reject(new Error("Something went wrong.. Please try later..!!"));

               }

          });
          
          // responseObj.statusCode = "1";
          // responseObj.verificationCode = verificationCode;
          // responseObj.message = "Verification Code sent to registered mobileNo";

          // resolve(responseObj);
          
     })
}