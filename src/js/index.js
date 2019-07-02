var renderLib = (function () {
  var alphaList = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];

  function getCheckbox(data, idx) {
    var optionHtml = '';
    for (var i = 0; i < data.data.length; i++) {
      var item = data.data[i];
      optionHtml +=
        '<label>\
      <input type="checkbox" value="' +
        alphaList[i] +
        '" name="checkbox' +
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
      '</div>' +
      getExtraTextArea(data, idx) +
      '</div>\
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
      <input type="radio"  value="' +
        alphaList[i] +
        '" name="radio' +
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
      '</div>' +
      getExtraTextArea(data, idx) +
      '</div>\
      </div>\
  </div>';
    return html;
  }

  function getExtraTextArea(data, idx) {
    if (!data.showOther) {
      return '';
    }
    return (
      '<textarea  data-idx="' +
      idx +
      '" class="form-control" placeholder="选择其他时，请在此填写详情" name="textarea' +
      idx +
      '" rows="5">\
           </textarea>'
    );
  }

  function validate(element) {
    console.log(element);
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
      '" class="form-control" placeholder="点击这里填写答案" name="textarea' +
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

  function bindEvent() {
    $('[data-idx] input').each(function (i, el) {
      $(el).change(function (e) { 
        let target = e.target;
        console.log(target,target.type,target.checked); 
      })
    });
  }

  // 获取答案
  function getAnswer(idx) {
    var item = paper[idx];
    var type = item.type || 'radio';
    var showOther = item.showOther;
    var answer = '';

    function getTextArea() {
      return $('[name="textarea' + idx + '"]')
        .val()
        .trim()
        .replace(/\r/g, '')
        .replace(/\n/g, '。');
    }

    switch (type) {
      case 'radio':
        answer = $('[name="radio' + idx + '"]:checked').val();
        break;
      case 'checkbox':
        var arr = [];
        $('[name="checkbox' + idx + '"]:checked').each(function (i, item) {
          arr[i] = $(item).val();
        });
        answer = arr.join('、');
        break;
      case 'textarea':
      default:
        answer = getTextArea();
        break;
    }

    var remark = '';
    if (showOther) {
      remark = getTextArea();
    }

    if (typeof answer == 'undefined') {
      answer = '';
    }

    if (typeof remark == 'undefined') {
      remark = '';
    }

    return {
      answer: answer,
      remark: remark
    };
  }

  var getParams = function(ip) {
    var start_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    var params = { start_time: start_time, ip: ip },
      remark = { start_time: start_time, ip: ip };

    var paperLen = paper.length;

    for (var i = 0; i < paperLen; i++) {
      var res = renderLib.getAnswer(i);
      params['remark_' + i] = res.answer;
      remark['remark_' + i] = res.remark;
    }
    return { params: params, remark: remark };
  };

  return {
    // getCheckbox: getCheckbox,
    // getRadio: getRadio,
    // getTextarea: getTextarea,
    initHtml: initHtml,
    getAnswer: getAnswer,
    bindEvent: bindEvent,
    getParams: getParams
  };
})();

$(function () {
  var url = 'http://api.cbpc.ltd/';
  var ip = '';

  $.get(url + 'ip').then(function(res) {
    console.log(res);
    ip = res.ip;
  });

  var html = renderLib.initHtml();
  $('#paper-wrap').html(html);
  renderLib.bindEvent();

  $('#submit').on('click', function() {
    var data = renderLib.getParams(ip);
    console.log(data);
  });
});
