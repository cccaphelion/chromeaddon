
var debug = false;

cLog("Start");


if( $() )
	cLog("JQUERY Active");
else
	cLog("No JQUERY here");
//
// Parses and puts in a hash map CGI URL parameters.
//
cLog("Window href:"+window.location.href);

//debugLayer = { 'FORM3' : 1, 'PROF' : 1 };
debugLayer = { 'INJ' : 1 };

var vars = null;
function getUrlVars()

{
	if (!vars) {
		vars = [];
		var hash;
		var positionQ = window.location.href.indexOf('?');
		var positionS = window.location.href.indexOf('#');
		
		if (positionQ > 0 && positionS > 0)
			position = Math.min(positionQ,positionS);
		else if (positionQ > 0)
			position = positionQ;
		else position = positionS;
			
		var hashes = window.location.href.slice(position+1).split(/&|#/);
	
	    for(var i = 0; i < hashes.length; i++)
	    {
	        cLog('VALUE:'+hashes[i]);
	        hash = hashes[i].split('=');
	        //vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    
	    }
	    // Possibly missing hl value is filled with languages value corresponding to TLD value
	    if (!vars['hl'])
	    	vars['hl'] = domainsToLang[getTLD()];
	}
    return vars;
}

function getTLD()
{
	var tld = window.location.href.match(/\.(\w+?)(\/|$)/)[1];
	cLog('TLD='+tld);
	return tld;
}
cLog('TLD:'+getTLD());

// 
// Main 
//


//var addPath = "/html/body/div/*/div/div[2]/div";
//var addPath = "/html/body/div/div/div[2]/div[@id='resultStats']";
//var addPath = "/html/body/div[@id='main']/div[@id='cnt']/div[@id='subform_ctrl']";
//var addSelector = '#resultStats';
var addPaths = [ "//*[@id='resultStats']", "//*[@id='gbx1']" ];

//
// Add Possible Injection points below
//
// Places where to try injection of Language switcher box
var addSelectors = { "#resultStats" : 1, "#slim_appbar" : 1, "#extabar" : 1, "#topabar" : 1, ".med" : 1, ".g" : 1, ".appbar" : 1};
var languageVars = [ "hl", "#hl" ];
var documentFormName = 'gbqf';

/*
 *   Injected Code for querying as a different language
 */
var labels = ["en-US", "en-UK", "it", "fr","de","es","cn/hk","jp","ru","nl"];
//,"nl","ru","gr","jp","tr","cn","arb","il");

var languages = ["en","en", "it","fr","de","es","zh-CN","ja","ru","nl"];
//,"nl","ru","el","ja","tr","zh-CN","ar","iw");

var domains = ["com", "co.uk", "it", "fr", "de", "es", "com.hk", "co.jp","ru","nl"];
var tlds = ["com", "uk", "it", "fr", "de", "es", "cn", "jp","ru","nl"];

var wikipediaDomains = ["en","en", "it","fr","de","es","zh","ja","ru","nl"];

var domainsToLang = [];

for (var i = 0; i < domains.length; i++)
	{
		domainsToLang[tlds[i]] = languages[i];
	}

var injectedObjectName = 'AGB_language_switcher';

var status = new Array();

var radioOn = "checked=\"checked\"";
var radioOff = "";

for (var i = 0; i < labels.length; i++)
{
   if (languages[i] != getUrlVars()["hl"] )
      status[languages[i]] = radioOff;
   else
      status[languages[i]] = radioOn;
}

cLog("GetURlVars="+getUrlVars());
cLog("n_lang is="+getUrlVars()["n_lang"]);
cLog("hl is="+getUrlVars()["hl"]);
cLog("q is="+getUrlVars()["q"]);
cLog("Languages[n_lang] is="+status[getUrlVars()["hl"]]);


var inject = "<div id='"+injectedObjectName+"' class='q qs', style='float:right'><br>Ask again on another local version: \
<table  width='100%' border='0' cellpadding='0' cellspacing='0' style='position:static'><td> \
<table border='0' cellpadding='0' cellspacing='0'> \
<tbody><tr><th scope='row' align='left'>Google:</th>";
 
//
// Prepare code for radio buttons to be injected in Google page results
//



for (var i = 0; i < languages.length; i++)
{
   //var clicInject = "document."+documentFormName+".hl.value ='"+languages[i]+"'; document."+documentFormName+".submit(); ";
    cLog("Injecting "+domains[i]+" code");
	var clicInject = 
	    "console.log('clic"+domains[i]+"'); var a = window.location.href.slice(0); " +
   		"console.log(a); a = a.replace(/google\\.(.*?)\\//,'google."+domains[i]+"/');" +
   		"console.log(a); if (!a.match( /(\\?|\\&)hl=/ )) a = a + '&hl='; " +
   		"a = a.replace(/hl=(.*?)(&|$)/,'hl="+languages[i]+"$2'); " +
   	    "console.log(a); " +
   	    "window.location.href =a; " +
   	    "console.log('clac"+domains[i]+"');";
   var checked = (languages[i] == getUrlVars()["hl"]) && (tlds[i] == getTLD());

   inject += "<td nowrap valign='middle'><input id='g_"+languages[i]+"' "+(checked ? ' checked ' :'')+"type=radio name=n_lang value='"+languages[i]+"' \
                             onClick=\""+clicInject+"\"><label for=il>"+labels[i]+"</label></td>";
}
inject += "<td>&nbsp;&nbsp;&nbsp;</td>";
cLog("This is what I'm injecting:"+inject);
/*
function getClicFunction(i)
{
	return function() { document[documentFormName].hl.value = languages[i]; document[documentFormName].submit(); };
}
for (var i = 0; i < languages.length; i++)
	{
		inject.append($('<td>').attr({ 'valign' : 'middle' })
							.append($('<input>').attr( { id : 'g_'+languages[i], type : 'radio', name : 'n_lang', value : languages[i]}
							)
					  ));
	}
*/
//
// Adds Wikipedia radio buttons. Constructs xx.wikipedia.org for xx taken from wikipediaDomains[] 
//
  inject += "</tr><tr><th scope='row' align='left'>Wikipedia:</th>";
  var query = getUrlVars()["q"]; 
  for (var i = 0; i < languages.length; i++)
  {
     var clicWikiInject = "window.location = 'http://"+wikipediaDomains[i]+".wikipedia.org/?search="+query+"';";
 
    inject += "<td nowrap valign='middle'><input id=g_w"+languages[i]+" type=radio name=n_lang value='w"+languages[i]+"' \
                             onClick=\""+clicWikiInject+"\"><label for=il>"+labels[i]+"</label></td>";

  }
   inject += "<td>&nbsp;&nbsp;&nbsp;</td></tr></tbody></table></td></table>";

   tryInjection();
   document.addEventListener("DOMNodeInserted", function(event){
       var element = event.target;
       //cLog("Node INSERTED "+element.name);
       //if (element.className == 'med') {
       	tryInjection();
       //}
   });

var alreadyInjected = false;
function tryInjection() 
{
   if (alreadyInjected) return;
   var placeToInject = null;
     if (!document.getElementById(injectedObjectName)) {
         lLog("Starting injection","INJ");

    	 for (var selector in addSelectors) {
	    	  lLog("Attempting injection point: "+selector,"INJ");   
	    	  if (placeToInject = $(selector).get(0)) 
	    	  { 
	    		  lLog("Matched Selector:"+selector,"INJ"); break; 
	    	  }
	      }
	      lLog("Place to inject:"+placeToInject,"INJ");
			if (placeToInject) 
			{
			      //placeToInject.innerHTML = "<td>"+inject+"</td></div>" + placeToInject.innerHTML;
				  $(selector).after(inject);
			      alreadyInjected = true;
			}
		      lLog("Ending injection","INJ");
	
         }
         else lLog("Looks like there is already a language_switcher here.","INJ2");
}
	
function cLog(str)
{
  if (debug) console.log(str);
}

/**
 * main logging function
 * @param str  String to be printed
 * @param level debugLayer triggering the printout. Will be printed only if level is in the currently active debugLayers 
 */

function lLog(str, level) {
	//console.log("Logging:"+str);
	if (!isNaN(level))
		str += " USING NUMBERS FOR DEBUG LEVELS IS DEPRECATED - ";
	else if (level.match(/PROF/))
		{
		   str = this.debug.getPace()  + "\n" + str;
		};
//	console.log("mid Logging:"+this.debugLayer+" "+this.localLog);

		if (debugLayer == level || debugLayer == "ALL" || (debugLayer instanceof Object && debugLayer[level]) )
		{ cLog(str); }
	//console.log("end Logging:"+str);
	
};

//
// XPath evaluation wrapping function.
//
function xpath(query,node) {
    return document.evaluate(query, node, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

//
// Returns the first element of a given XPath query
//
function fXPath(query,node) 
   {
      var elements = xpath(query,node);
      return elements.snapshotItem(0);
   }

//
// Returns the last element of a given XPath query
//
function lXPath(query,node) 
   {
      cLog("Asking for "+query);
      var elements = xpath(query,node);
      cLog("Elements are "+elements.snapshotLength);
      return elements.snapshotItem(elements.snapshotLength-1);
   }

//
// 0-ize NaN and non-number strings
//    
function normalize(str) {
       var temp = (str != null) ? parseInt(str) : 0;
       return (isNaN(temp)) ? 0 : temp;
}





