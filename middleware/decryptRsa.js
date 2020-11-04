const crypto = require('crypto')

const privateKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXrWsEilkbjkamb/VMMJye/Vykux87phJMAomkg+U0tRVMKPD2j4aY608OI7Q7D0+FeGqtRN5L6xRw+ZYlX5VxQ+RieVPdk1c2k9xGUVsfGTMzkynipIgLnPJnkHsZapHX03JDruYcfnOw63QopP6ITASZXMh5Hp5jyFTQc9Qapx3jdFNZaUoUcBLt5wIdGMQVY0DrXINwu374cDkyhOqxS34hgHD7swcIevdtuuSwp5e/VYFsLPf/fnnXoIxGnT9piy0vSoAZEY+BKZPMTu9gmARjGJwAqniqlRVtsxaRpfgM2Vurza4gpq7RKR34StRPdsjWKhg7M2X7IW5t/bI/AgMBAAECggEAID3Z0NZDyMq+k+SapP50XIuI5O9t3TUZEJU9gv4Se9i+VTkit5acyubCIERQrHk9syZ8rqZEBqlK6BT16K3fy3reElyuChym3lAh88SZdQvbSWxP7ACDdsx+7qrUr/tqUxF8aYzFF2t91i7Gu1kPThOyqpMBflWW36kW9lSY0q09hl8J7YzQTzJtACSDIJOlhkuYKxhejQcq0JQPfUBTb2ddXqIk5ynm4NFci6Rqfq9OAAQJxRGoQqJa8LShNO1O/XaFTNP/gulc3woek8aikT1/V/0AN9wIe+qQgtABkGNTNCMqhESM9uYuMNNNmELDmoeq5MlkWKdLkxoC929PmQKBgQDSUZErzU6Up2VeU517/fBm5hcvLwo8QFMsNNb8ItjrDXdCyN9y2k/TZxuFZG+7AVgKEi62z877UMCgj048LfhsPRKSX/G5GY4BFBpOpP+TRAMSVjpersdfa6Rs4xun9SC8dt6Ggqk+j3UDVG6LlZdgepsY4qvZFHytg7qwaQDI8wKBgQC4nzMkFOumTVRHzf0XjMtzn45Ai7TMwk1QJBOMwOC1IQx3qD5uSykO8CXGJPzEX9+vNQse5p4rWl1hj1Xcca+TmJHEJnHkN9I1+TvueXwePbHXNkN4fntSSWnlsNK1APLo8HCAmnxqzKgx+650QadhubYeT42Wo87FW/kgYSiEhQKBgQCRcGZ7a9ZTZg7rU9crz0dXYPXXYygo0jKx9zhT06U9pmo6fL5Ipj9daYfWjsXVA/Dlxf0X3ky77fPHFFJ9uyx3bSRSpJZ78fgJNuWaTO+P3xBgtdBXeXXVvpJN2h9d3l1s9qabTe/Lm1jHnLN1Q1UTGrX2V4mO7GPreZS4OWSZkQKBgAIhNAHSi/VbJwG9CpJe+WnYCVgNRISoKSQnhmI1R2JPg0lOE4pKK6sUchsbCh9py7bFsd8lYeW2ISWi9aaZWSEmvWe52c58JlyhB2P02s2ugIKvCZA2RU3psuMHaybTX/n37BRPs+e3fKk28gg9SaUC82reGBAIy7XTHciV1lXRAoGBAJcq5LU0/JmyBLB1cTbuF8qhiHnlU4GydnRMMnL0DM8cpMeea9abl8sW/aFQrSZSKHLiA6DX5FHkOuNO2pILZP2YbBbef4i4zfiZvjpK8osEc+kk6w78ZHxkrpW1hL6Q0agiqEwgx3zxR/DJ7PEbAb+vIkAcb0uSxVQWKTOWwJYi"


crypto.privateDecrypt(privateKey, buffer)

// const NodeRSA = require('node-rsa')


// const key = new NodeRSA();

// key.generateKeyPair(2048, 65537);

// console.log("public Key" + key.exportKey("pkcs8-public-pem"));

// console.log("private Key" + key.exportKey("pkcs8-private-pem"));


// // createNewKey();

// let str = "Im Suffering with pain";
// let publicEncryptedString = key.encrypt(str);
// console.log("public Encrypted" + publicEncryptedString);

// let privateDecryptedString = key.decrypt(publicEncryptedString);
// console.log("MobileNo Decrypted" + privateDecryptedString);


// let privateEncryptedString = key.encryptPrivate(str);
// console.log("Private Encrypted" + privateEncryptedString);


// let publicDecryptedString = key.decryptPublic(privateEncryptedString);
// console.log("Public decrypted" + publicDecryptedString);

// let str = "Im Suffering with pain";
// console.log("ecrypted" + key.encrypt(str));