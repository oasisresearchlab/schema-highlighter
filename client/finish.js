Template.finishPage.helpers({
    completeCode : function() {
        console.log("generating completion code");
        var code = Random.hexString(20).toLowerCase();
        return code;
    }
});