var renderLib = (function() {
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

  function handleTitle(title) {
    var res = title.match(/最多选\d项/);
    if (res == null) {
      return title;
    }
    var replaceStr = res[0];
    return title.replace(
      replaceStr,
      '<span style="color:#ee6677;">' + replaceStr + '</span>'
    );
  }

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
      '<div class="item row"  data-idx="' +
      idx +
      '"  >\
      <div class="col-md-12">\
          <h4 class="title">' +
      (idx + 1) +
      '.' +
      handleTitle(data.title) +
      '</h4>\
      <p class="hasErr">答案数量超过最多选择数，系统将不允许提交。</p>\
      <div class="options">\
              <div class="checkbox">' +
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
      '<div class="item row"  data-idx="' +
      idx +
      '"  >\
      <div class="col-md-12">\
          <h4 class="title">' +
      (idx + 1) +
      '.' +
      handleTitle(data.title) +
      '</h4>\
          <div class="options">\
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
      '<textarea class="form-control" placeholder="选择其他时，请在此填写详情" name="textarea' +
      idx +
      '" rows="5"></textarea>'
    );
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
            <textarea class="form-control" placeholder="点击这里填写答案" name="textarea' +
      idx +
      '" rows="5"></textarea>\
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

  function validate(answerId) {
    let question = paper[answerId];
    var answer = getAnswer(answerId);
    if (question.length) {
      var $errDom = $('.item[data-idx=' + answerId + ']').find('.hasErr');

      if (answer.answer.split('、').length > question.length) {
        console.log('超过');
        $errDom.show();
      } else {
        console.log('正常');
        $errDom.hide();
      }
    }
  }

  function bindEvent() {
    $('[data-idx] input').each(function(i, el) {
      $(el).change(function(e) {
        let target = e.target;
        let answerId = target.name.replace(/\D/g, '');
        validate(answerId);
      });
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
        $('[name="checkbox' + idx + '"]:checked').each(function(i, item) {
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
      params['remark_' + (i + 1)] = res.answer;
      remark['remark_' + (i + 1)] = res.remark;
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

$(function() {
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
