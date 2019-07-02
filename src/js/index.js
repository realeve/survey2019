var renderLib = (function() {
  function getCheckbox(data, idx) {
    var optionHtml = '';
    for (var i = 0; i < data.data.length; i++) {
      var item = data.data[i];
      optionHtml +=
        '<label>\
      <input type="checkbox" name="checkbox' +
        idx +
        '">\
      <span>' +
        item +
        '</span>\
    </label>';
    }
    var html =
      '<div class="item row">\
      <div class="col-md-12">\
          <h4 class="title">' +
      (idx + 1) +
      '.' +
      data.title +
      '</h4>\
          <div class="options">\
              <div class="checkbox" data-idx="' +
      idx +
      '">' +
      optionHtml +
      '</div>\
          </div>\
      </div>\
  </div>';
    return html;
  }

  function getRadio(data, idx) {
    var optionHtml = '';
    for (var i = 0; i < data.data.length; i++) {
      var item = data.data[i];
      optionHtml +=
        '<label>\
      <input type="radio" name="radio' +
        idx +
        '">\
      <span>' +
        item +
        '</span>\
    </label>';
    }
    var html =
      '<div class="item row">\
      <div class="col-md-12">\
          <h4 class="title">' +
      (idx + 1) +
      '.' +
      data.title +
      '</h4>\
          <div class="options" data-idx="' +
      idx +
      '">\
              <div class="radio">' +
      optionHtml +
      '</div>\
          </div>\
      </div>\
  </div>';
    return html;
  }

  function getTextarea(data, idx) {
    return (
      '<div class="item row">\
    <div class="col-md-12">\
        <h4 class="title">' +
      (idx + 1) +
      '.' +
      data.title +
      '</h4>\
        <div class="options">\
            <textarea  data-idx="' +
      idx +
      '" class="form-control" placeholder="点击这里填写答案" name="textarea+' +
      idx +
      '" rows="5">\
            </textarea>\
        </div>\
    </div>\
</div>'
    );
  }

  function initHtml() {
    var len = paper.length;
    var html = '';
    for (var i = 0; i < len; i++) {
      var item = paper[i];
      if (item.type === 'checkbox') {
        html += getCheckbox(item, i);
      } else if (item.type === 'textarea') {
        html += getTextarea(item, i);
      } else {
        html += getRadio(item, i);
      }

      // if (item.showOther) {
      //   html += getTextarea(item, i,'');
      // }
    }
    return html;
  }

  return {
    getCheckbox: getCheckbox,
    getRadio: getRadio,
    getTextarea: getTextarea,
    initHtml: initHtml
  };
})();

$(function() {
  var url = 'http://api.cbpc.ltd/';
  var ip = '';

  console.log(paper);
  $.get(url + 'ip').then(function(res) {
    console.log(res);
    ip = res.ip;
  });

  var html = renderLib.initHtml();
  $('#paper-wrap').html(html);
});
