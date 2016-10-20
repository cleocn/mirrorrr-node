
// ################################################################################

// # URLs that have absolute addresses
var ABSOLUTE_URL_REGEX = "(http(s?):)?//(?<url>[^\"'> \\t\\)]+)";

// # URLs that are relative to the base of the current hostname.
var BASE_RELATIVE_URL_REGEX = "/(?!(/)|(http(s?)://)|(url\\\())(?<url>[^\"'> \\t\\)]*)";

// # URLs that have '../' or './' to start off their paths.
var TRAVERSAL_URL_REGEX = "(\\.(\\.)?)/(?!(/)|(http(s?)://)|(url\\\())(?<url>[^\"'>\\t)]*)";

// # URLs that are in the same directory as the requested URL.
var SAME_DIR_URL_REGEX = "(?!(/)|(http(s?)://)|(url\\\())(?<url>[^\"'> \\t )]+)";

// # URL matches the root directory.
var ROOT_DIR_URL_REGEX = "(?!//(?!>))/(?<url>)(?=[ \\t\\n]*[\"')>/])";

// # Start of a tag using 'src' or 'href'
var TAG_START = "(?i)\\b(?<tag>[sS][rR][cC]|[hH][rR][eE][fF]|[aA][cC][tT][iI][oO][nN]|[uU][rR][lL]|[bB][aA][cC][kK][gG][rR][oO][uU][nN][dD])(?<equals>[\\t ]*=[\\t ]*)(?<quote>[\"']?)";

// # Start of a CSS import
var CSS_IMPORT_START = "(?i)@[iI][mM][pP][oO][rR][tT](?<spacing>[\\t ]+)(?<quote>[\"']?)";

// # CSS url() call
var CSS_URL_START = "(?i)\\b[uU][rR][lL]\\\((?<quote>[\"']?)";


var REPLACEMENT_REGEXES = [
  { 
    pattern:TAG_START + SAME_DIR_URL_REGEX,
    replacement:"\\g{tag}\\g{equals}\\g{quote}{{accessed_dir}}s\\g{url}"
  },
  { 
    pattern:TAG_START + TRAVERSAL_URL_REGEX,
    replacement:"\\g{tag}\\g{equals}\\g{quote}{{accessed_dir}}s/\\g{relative}/\\g{url}"
  },
  { 
    pattern:TAG_START + BASE_RELATIVE_URL_REGEX,
    replacement: "\\g{tag}\\g{equals}\\g{quote}/{{base}}s/\\g{url}"
  },
  { 
    pattern:TAG_START + ROOT_DIR_URL_REGEX,
    replacement: "\\g{tag}\\g{equals}\\g{quote}/{{base}}s/"
  },
  // # Need this because HTML tags could end with '/>', which confuses the
  // # tag-matching regex above, since that's the end-of-match signal.
  { 
    pattern:TAG_START + ABSOLUTE_URL_REGEX,
     replacement:"\\g{tag}\\g{equals}\\g{quote}/\\g{url}"
  },
  { 
    pattern:CSS_IMPORT_START + SAME_DIR_URL_REGEX,
     replacement:"@import\\g{spacing}\\g{quote}{{accessed_dir}}s\\g{url}"
  },
  { 
    pattern:CSS_IMPORT_START + TRAVERSAL_URL_REGEX,
     replacement:"@import\\g{spacing}\\g{quote}{{accessed_dir}}s/\\g{relative}/\\g{url}"
  },
  { 
    pattern:CSS_IMPORT_START + BASE_RELATIVE_URL_REGEX,
     replacement:"@import\\g{spacing}\\g{quote}/{{base}}s/\\g{url}"
  },
  { 
    pattern:CSS_IMPORT_START + ABSOLUTE_URL_REGEX,
     replacement:"@import\\g{spacing}\\g{quote}/\\g{url}"
  },
  { 
    pattern:CSS_URL_START + SAME_DIR_URL_REGEX,
     replacement:"url(\\g{quote}{{accessed_dir}}s\\g{url}"
  },
  { 
    pattern:CSS_URL_START + TRAVERSAL_URL_REGEX,
      replacement:"url(\\g{quote}{{accessed_dir}}s/\\g{relative}/\\g{url}"
  },
  { 
    pattern:CSS_URL_START + BASE_RELATIVE_URL_REGEX,
      replacement:"url(\\g{quote}/{{base}}s/\\g{url}"
  },
  { 
    pattern:CSS_URL_START + ABSOLUTE_URL_REGEX,
      replacement:"url(\\g{quote}/\\g{url}"
  }
];

// ################################################################################

var Mustache = require('Mustache');

var endsWith = function(str0,str){     
  var reg=new RegExp(str+"$");     
  return reg.test(str0);        
};

var XRegExp = require('xregexp');

module.exports = {
  TransformContent: function (accessed_url, content){
    url_obj = require('url').parse(accessed_url);
    base_url = url_obj.hostname ;
    console.log("url_obj:",url_obj);
    accessed_dir = require("path").dirname(url_obj.path);
    console.log("accessed_dir:",accessed_dir);
    if (!endsWith(accessed_dir,"/"))
      accessed_dir += "/"

    REPLACEMENT_REGEXES.forEach(function (item) {
      // console.log(item);
      fixed_replacement = Mustache.render(item.replacement , {
        "base": base_url,
        "accessed_dir": accessed_dir,
      });
      console.log("fixed_replacement:",fixed_replacement);

      // content = re.sub(item.pattern, fixed_replacement, content);
      content = XRegExp.replace(content,XRegExp(item.pattern), fixed_replacement);
    });

    return content;
    }
}