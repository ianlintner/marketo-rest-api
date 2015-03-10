var Client = require('node-rest-client').Client;
var async = require('async');

client = new Client();

function marketoRestApi(endPointUrl, clientId, clientSecret) {
  this.client_id = clientId;
  this.client_secret = clientSecret;
  this.token = null;
  this.pagingToken = null;

  //Register REST methods availible

  //GET Tokens
  client.registerMethod("getToken", endPointUrl + "/identity/oauth/token", "GET");
  client.registerMethod("getActivitiesPagingToken", endPointUrl + "/rest/v1/activities/pagingtoken.json", "GET");

  //GETs
  client.registerMethod("getLead", endPointUrl + "/rest/v1/lead/${id}.json", "GET");
  client.registerMethod("getLeads", endPointUrl + "/rest/v1/leads.json", "GET");
  client.registerMethod("getLeadsByList", endPointUrl + "/rest/v1/list/${listId}/leads.json", "GET");
  client.registerMethod("getLeadPartions", endPointUrl + "/rest/v1/leads/partitions.json", "GET");
  client.registerMethod("getList", endPointUrl + "/rest/v1/lists/${id}.json", "GET");
  client.registerMethod("getIsList", endPointUrl + "/rest/v1/lists/${listId}/leads/ismember.json", "GET");
  client.registerMethod("getCampaigns", endPointUrl + "/rest/v1/campaigns/${id}.json", "GET");
  client.registerMethod("getBulkLeads", endPointUrl + "/bulk/v1/leads/batch/${id}.json", "GET");
  client.registerMethod("getBulkLeadsFailure", endPointUrl + "/bulk/v1/leads/batch/${id}/failures.json", "GET");
  client.registerMethod("getBulkLeadsWarning", endPointUrl + "/bulk/v1/leads/batch/${id}/warnings.json", "GET");
  client.registerMethod("getLeadsDescribe", endPointUrl + "/rest/v1/leads/describe.json", "GET");
  client.registerMethod("getLeadActivities", endPointUrl + "/rest/v1/activities.json", "GET");
  client.registerMethod("getActivitiesTypes", endPointUrl + "/rest/v1/activities/types.json", "GET");
  client.registerMethod("getActivitiesLeadChange", endPointUrl + "/rest/v1/activities/leadchanges.json", "GET");
  client.registerMethod("getStatsUsage", endPointUrl + "/rest/v1/stats/usage.json", "GET");
  client.registerMethod("getStatsUsageLast7Days", endPointUrl + "/rest/v1/stats/usage/last7days.json", "GET");
  client.registerMethod("getStatsErrors", endPointUrl + "/rest/v1/stats/errors.json", "GET");
  client.registerMethod("getStatsErrorsLast7Days", endPointUrl + "/rest/v1/stats/errors/last7days.json", "GET");

  //POSTs
  client.registerMethod("postLeads", endPointUrl + "/rest/v1/leads.json", "POST");
  client.registerMethod("postAssociateLead", endPointUrl + "/rest/v1/leads/${id}/associate.json", "POST");
  client.registerMethod("postMergeLead", endPointUrl + "/rest/v1/leads/${id}/merge.json", "POST");
  client.registerMethod("putScheduleCampaigns", endPointUrl + "/rest/v1/campaigns/${id}/schedule.json", "POST");
  client.registerMethod("putTrigger", endPointUrl + "/rest/v1/campaigns/${id}/trigger.json", "POST");
  client.registerMethod("putBulkLeads", endPointUrl + "/bulk/v1/leads.json", "POST");

}


marketoRestApi.prototype.getToken = function(callback) {
  var args ={
    data:{},
    path:{},
    parameters:{"grant_type" : "client_credentials", "client_id" : this.client_id, "client_secret" : this.client_secret},
    headers:{}
  };
  var thisObject = this;
  client.methods.getToken(args, function(data, response){
    //Set my token
    thisObject.token = data;
    callback(true);
  });

}

marketoRestApi.prototype.checkToken = function() {
  if(this.token === null) {
    throw new Error('Authentication Token is not set.')
  }
  return true;
}

marketoRestApi.prototype.getPagingToken = function(sinceDateTime, callback) {
  this.checkToken();

  var args ={
    data:{},
    path:{},
    parameters:{"access_token" : this.token.access_token, "sinceDatetime" : sinceDateTime},
    headers:{}
  };
  var thisObject = this;
  client.methods.getActivitiesPagingToken(args, function(data, response){
    thisObject.pagingToken = data;
    callback(true);
  });

}
marketoRestApi.prototype.checkPagingToken = function() {
  if(this.pagingToken === null) {
    throw new Error('Paging Token is not set.')
  }
  return true;
}

/**
 * Calls REST API lead.json (Get Lead by Id)
 * @param leadId string marketo id
 * @param callback function callback
 * @param fields string csv
 *
 * default field names
 * If the fields parameter is not included in this request, the following default fields will be returned: email,
 * updatedAt, createdAt, lastName, firstName, and id.
 */
marketoRestApi.prototype.getLead = function(leadId, callback, fields) {
  this.checkToken();

  var args ={
    data:{},
    path:{"id":leadId},
    parameters:{"access_token" : this.token.access_token},
    headers:{}
  };

  client.methods.getLead(args, function(data,response){
    callback(data);
  });

}

/**
 * Calls REST API leads.json (Get Multiple Leads by Filter Type)
 * This API will retrieve multiple leads for a given search criteria.
 *
 * @param leadId
 * @param filterType string (REQUIRED)
 * @param filterValues string csv (REQUIRED)
 * @param callback method callback
 * @param fields string csv
 * @param batchSize int max 300
 * @param nextPageToken tokenId
 *
 * Supported filter types include, but not limited to:
 * id
 * cookie
 * email
 * twitterId
 * facebookId
 * linkedInId
 * sfdcAccountId
 * sfdcContactId
 * sfdcLeadId
 * sfdcLeadOwnerId
 * sfdcOpptyId
 * custom field
 *
 * default fields
 * Comma separated list of field names to be returned in the response. If the fields parameter is not included in this
 * request, the following default fields will be returned: email, updatedAt, createdAt, lastName, firstName, and id.
 */
marketoRestApi.prototype.getLeads = function(leadId, filterType, filterValues, callback, fields, batchSize, nextPageToken) {
  this.checkToken();

  var args ={
    data:{},
    path:{"id":leadId},
    parameters:{"access_token" : this.token.access_token, "filterType" : filterType, "filterValues" :  filterValues},
    headers:{}
  };

  if(fields !== null) {
    args.parameters.fields = fields;
  }
  if(batchSize !== null) {
    args.parameters.batchSize = batchSize;
  }
  if(nextPageToken !== null) {
    args.parameters.nextPageToken = nextPageToken;
  }

  client.methods.getLeads(args, function(data,response){
    callback(data);
  });

}

/**
 * Calls REST API leads.json (Get Multiple Leads by List Id)
 * @param listId string marketo list id (Required)
 * @param callback function callback
 * @param fields string csv
 * @param nextPageToken tokenId
 * @param batchSize int max 300
 *
 * default fields
 * If the fields parameter is not included in this request, the following default fields will be returned: email,
 * updatedAt, createdAt, lastName, firstName, and id.
 */
marketoRestApi.prototype.getLeadsByList = function(listId, callback, batchSize, nextPageToken, fields) {
  this.checkToken();

  var args ={
    data:{},
    path:{"id" : listId},
    parameters:{"access_token" : this.token.access_token},
    headers:{}
  };

  if(fields !== null) {
    args.parameters.fields = fields;
  }
  if(batchSize !== null) {
    args.parameters.batchSize = batchSize;
  }
  if(nextPageToken !== null) {
    args.parameters.nextPageToken = nextPageToken;
  }

  client.methods.getLeadsByList(args, function(data,response){
    callback(data);
  });
}


marketoRestApi.prototype.getActivitiesTypes = function(callback) {
  this.checkToken();

  var args ={
    data:{},
    path:{},
    parameters:{"access_token" : this.token.access_token},
    headers:{}
  };

  client.methods.getActivitiesTypes(args, function(data,response){
    callback(data);
  });

}

marketoRestApi.prototype.getLeadActivities = function (activityTypeIds, nextPageTokenId, callback) {
  this.checkToken();

  if(nextPageTokenId == null) {
    this.checkPagingToken();
    nextPageTokenId = this.pagingToken.nextPageToken;
  }

  var args ={
    data:{},
    path:{},
    parameters:{"access_token" : this.token.access_token, "activityTypeIds" : activityTypeIds,
      "nextPageToken" : nextPageTokenId},
    headers:{}
  };

  client.methods.getLeadActivities(args, function(data,response){
    callback(data);
  });

}

marketoRestApi.prototype.postAssociateLead = function(leadId, cookie, callback) {
  var args ={
    data:{},
    path:{"id":leadId},
    parameters:{"access_token" : this.token.access_token, "cookie" : cookie },
    headers:{"Content-Type": "application/json"}
  };

  client.methods.postAssociateLead(args, function(data){
    callback(data);
  });

}

module.exports =  marketoRestApi;


