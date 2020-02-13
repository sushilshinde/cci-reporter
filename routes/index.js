var express = require("express");
var router = express.Router();

router.get("/", async function (req, res, next) {

  const axios = require("axios");
  require("moment-timezone");
  const moment = require("moment");

  require("dotenv").config();

  function buildResponse(p) {
    const ENVS = [
      "build-dev",
      "build-prod-beta",
      "build-test",
      "build-qa",
      "build-prod"
    ];
    let latest = [];
    let str = "";
    //str = str.concat("*Test environments deployments*");
    //str = str.concat("```\n");
    str = str.concat("env: branch-deployed / build-num / Date-Time IST <br>");

    str = str.concat(
      "-----------------------------------------------------<br>"
    );

    for (i = 0; i < p.length; i++) {
      const ob = p[i];
      if (
        ob.workflows &&
        ob.workflows.job_name &&
        ENVS.indexOf(ob.workflows.job_name) >= 0 &&
        latest.indexOf(ob.workflows.job_name) < 0 &&
        ob.status === "success"
      ) {
        latest.push(ob.workflows.job_name);
        str = str.concat(
          ob.workflows.job_name.replace("build-", "") +
          " : " +
          ob.branch +
          " / " +
          ob.build_num +
          " / " +
          moment(ob.stop_time)
          .tz("Asia/Kolkata")
          .format("MMMM Do YYYY, h:mm:ss a") +
          " IST <br>"
        );
      }
      if (
        ob.workflows &&
        ob.workflows.job_name &&
        ENVS.indexOf(ob.workflows.job_name) >= 0 &&
        latest.indexOf(ob.workflows.job_name) < 0 &&
        ob.status === "running"
      ) {
        console.log(
          "Running workflow :" +
          ob.workflows.job_name.replace("build-", "") +
          " : " +
          ob.branch +
          " / " +
          ob.build_num +
          " / " +
          moment(ob.start_time)
          .tz("Asia/Kolkata")
          .format("MMMM Do YYYY, h:mm:ss a") +
          " IST"
        );
      }
    }
    str = str.concat(
      "<br>https://github.com/topcoder-platform/community-app/blob/develop/docs/deployment-env.md"
    );
    //str = str.concat("```\n");
    console.log(str);
    return str;
  }

  axios
    .get(
      `https://circleci.com/api/v1.1/project/github/${process.env.user}/${process.env.project}?circle-token=${process.env.CCItoken}&limit=99`
    )
    .then(function (response) {
      //console.log(response.data)
      const text = buildResponse(response.data);
      res.render("index", {
        text: text
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

module.exports = router;