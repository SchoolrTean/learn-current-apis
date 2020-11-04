const express = require('express');
const mongoose = require('mongoose');
const routes = express.Router();

const TopicsModel = require('../../models/admin/learn/academic/topicsModel');
const VideosModel = require('../../models/admin/learn/academic/videosModel');
const PartnerModel = require('../../models/partner/partner');

const topicVideos = require('./topicVideos.json')


/***************** Extract data from  Routes *******************/

routes.post('/', async (req, res, next) => {

      let _cfilesArray = new Array();

      if (req.files) {

            let _filesArray = req.files;

            _filesArray.forEach(_file => {
                  let correctPath = _file.path.replace(/\\/g, '/');
                  _cfilesArray.push(correctPath);
            });
      }


      let error = 0;

      for (let index2 = 0; index2 < topicVideos.length; index2++) {

            const topicVideosData = topicVideos[index2];

            let gradeId = topicVideosData.gradeId;
            let subjectId = topicVideosData.subjectId;



            for (let index = 0; index < topicVideosData.chapters.length; index++) {

                  const topic = topicVideosData.chapters[index].keywords;

                  const videos = topicVideosData.chapters[index].data;

                  // console.log('topic : ' + topic);

                  let videosExists = videos.length > 0 ? true : false;

                  const topicData = new TopicsModel({
                        _id: new mongoose.Types.ObjectId(),
                        gradeId,
                        subjectId,
                        topicName: topic,
                        searchableTopicName: topic.toLowerCase(),
                        videosExists: videosExists
                  })

                  await topicData.save()
                        .then(async topicSaved => {


                              if (videos.length > 0) {

                                    for (let index1 = 0; index1 < videos.length; index1++) {

                                          const video = videos[index1];

                                          //  console.log('topic : ' + topic);

                                          const videoData = new VideosModel({
                                                _id: new mongoose.Types.ObjectId(),
                                                gradeId,
                                                subjectId,
                                                topicId: topicSaved._id,
                                                videoTitle: video.title,
                                                searchTitle: video.title.toLowerCase(),
                                                videoUrl: video.link,
                                                videoDuration: video.Duration,
                                                videoViews: video.views,
                                          })

                                          await PartnerModel.findOne({
                                                      searchPartnerName: video.Channel
                                                }).exec()
                                                .then(async partnerExists => {

                                                      if (partnerExists) {

                                                            videoData.partnerId = partnerExists._id
                                                            await videoData.save();

                                                      } else {

                                                            const partnerData = new PartnerModel({
                                                                  _id: new mongoose.Types.ObjectId(),
                                                                  partnerName: video.Channel,
                                                                  searchPartnerName: video.Channel.toLowerCase()
                                                            })

                                                            await partnerData.save()
                                                                  .then(async partner => {
                                                                        videoData.partnerId = partner._id
                                                                        await videoData.save();
                                                                  }).catch(err => {
                                                                        console.log(err);
                                                                        error = 1;
                                                                  })

                                                      }

                                                }).catch(err => {
                                                      console.log(err);
                                                      error = 1;
                                                })

                                    }
                              }

                        })
                        .catch(err => {
                              console.log(err);
                              error = 1;
                        })
            }

      }




      if (error == 0) {
            res.status(200).json({
                  statusCode: "1",
                  message: "File Extracted Successfull..!!"
            })
      } else {
            res.status(200).json({
                  statusCode: "0",
                  message: "Something Went Wrong..!!"
            })
      }


});

/***************** ./ HomeWork Routes *******************/


module.exports = routes;