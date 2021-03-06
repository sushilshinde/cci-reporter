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
    str = str.concat("<div style='font-style: italic; font-size: 14px;' >( At - "+moment().tz("Asia/Kolkata").format("MMMM Do YYYY, h:mm:ss a") + " IST)</div><br>");
    str = str.concat("<div>env: branch-deployed / build-num / Date-Time IST </div>");
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
        str = str.concat("<br>" +
          ob.workflows.job_name.replace("build-", "") +
          " : " +
          ob.branch +
          " / " +
          +ob.build_num+
          "/ <span title='" + moment(ob.stop_time)
          .tz("America/New_York")
          .format("MMMM Do YYYY, h:mm:ss a") +
          " EDT"+"'>" +
          moment(ob.stop_time)
          .tz("Asia/Kolkata")
          .format("MMMM Do YYYY, h:mm:ss a") +
          " IST </span><br>"
        );
      }
      if (
        ob.workflows &&
        ob.workflows.job_name &&
        ENVS.indexOf(ob.workflows.job_name) >= 0 &&
        latest.indexOf(ob.workflows.job_name) < 0 &&
        ob.status === "running"
      ) {
        str = str.concat(
          "<br><font color='green'>Running workflow : " +
          ob.workflows.job_name.replace("build-", "") +
          " : " +
          ob.branch +
          " / " +
          ob.build_num +
          " / " +
          moment(ob.start_time)
          .tz("Asia/Kolkata")
          .format("MMMM Do YYYY, h:mm:ss a") +
          " IST </font><br>"
        );
      }
    }
    str = str.concat(
      "<br><a href='https://github.com/topcoder-platform/community-app/blob/develop/docs/deployment-env.md'>Deployment Environments</a>"
    );
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