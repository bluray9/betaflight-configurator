import GUI from "./gui";
import { i18n } from "./localization";
import { get as getStorage, set as setStorage } from "./SessionStorage";

const ReleaseChecker = function (releaseName, releaseUrl) {
    const self = this;

    self._releaseName = releaseName;
    self._releaseDataTag = `${self._releaseName}ReleaseData`;
    self._releaseLastUpdateTag = `${self._releaseName}ReleaseLastUpdate`;
    self._releaseUrl = releaseUrl;
};

ReleaseChecker.prototype.loadReleaseData = function (processFunction) {
    const self = this;
    const result = getStorage([self._releaseLastUpdateTag, self._releaseDataTag]);
    const releaseDataTimestamp = $.now();
    const cacheReleaseData = result[self._releaseDataTag];
    const cachedReleaseLastUpdate = result[self._releaseLastUpdateTag];

    if (!cacheReleaseData || !cachedReleaseLastUpdate || releaseDataTimestamp - cachedReleaseLastUpdate > 3600 * 1000) {
        $.get(self._releaseUrl, function (releaseData) {
            GUI.log(i18n.getMessage('releaseCheckLoaded',[self._releaseName]));

            const data = {};
            data[self._releaseDataTag] = releaseData;
            data[self._releaseLastUpdateTag] = releaseDataTimestamp;
            setStorage(data);

            self._processReleaseData(releaseData, processFunction);
        }).fail(function (data) {
            let message = '';
            if (data['responseJSON']) {
                message = data['responseJSON'].message;
            }
            GUI.log(i18n.getMessage('releaseCheckFailed',[self._releaseName,message]));

            self._processReleaseData(cacheReleaseData, processFunction);
        });
    } else {
        if (cacheReleaseData) {
            GUI.log(i18n.getMessage('releaseCheckCached',[self._releaseName]));
        }

        self._processReleaseData(cacheReleaseData, processFunction);
    }
};


ReleaseChecker.prototype._processReleaseData = function (releaseData, processFunction) {
    if (releaseData) {
        processFunction(releaseData);
    } else {
        GUI.log(i18n.getMessage('releaseCheckNoInfo',[self._releaseName]));

        processFunction();
    }
};

export default ReleaseChecker;
