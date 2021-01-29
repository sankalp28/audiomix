import { APIService } from "@/service/api.js";
let urlConstant = window.APIUrls;
export default {
  methods: {
    scaleConversion(inputValue, inputLow, inputHigh, outputLow, outputHigh) {
      // ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
      return (
        ((inputValue - inputLow) / (inputHigh - inputLow)) *
          (outputHigh - outputLow) +
        outputLow
      );
    },
    setSourcesInApiWithoutCommit(sources) {
      let path = window.location.pathname.split("/");
      let taskid = null;
      if (path.length == 3) {
        taskid = path[2];
      }
      if (path.length == 2) {
        taskid = path[1];
      }
      APIService.post(
        urlConstant.baseUrl + urlConstant.getGains + taskid,
        sources
      ).catch((err) => {
        window.console.log("setGainValue", err);
      });
    },
    setDataInGroupsAPIWithoutCommit(groupData) {
      let path = window.location.pathname.split("/");
      let taskid = null;
      if (path.length == 3) {
        taskid = path[2];
      }
      if (path.length == 2) {
        taskid = path[1];
      }
      APIService.post(
        urlConstant.baseUrl + urlConstant.getGroups + taskid,
        groupData
      ).catch((err) => {
        window.console.log("setGainValue", err);
      });
    },
    getUrlConstant() {
      return urlConstant;
    },
  },
};
