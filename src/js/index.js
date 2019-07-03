var url = 'http://10.8.1.25:100/';

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
      <p class="hasErr">答案数量如果超过最多选择数，系统将不允许提交。</p>\
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
      '<textarea class="form-control remarkTextarea" placeholder="选择其他时，请在此填写详情" name="textarea' +
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

  function lockCheckbox(id) {
    // console.log('lock',id )
    $('[data-idx=' + id + '] input').each(function(i, el) {
      if (!el.checked) {
        $(el).attr('disabled', 'true');
      }
    });
  }

  function unlockCheckbox(id) {
    // console.log('unlock',id )
    $('[data-idx=' + id + '] input').each(function(i, el) {
      $(el).removeAttr('disabled');
    });
  }

  // 清除指定题目的textarea
  function clearTextArea(answerId) {
    $('.item[data-idx=' + answerId + ']')
      .find('textarea')
      .val('');
  }

  function getElIdx(el) {
    return el.name ? el.name.replace(/\D/g, '') : parseInt(el);
  }
  function validate(el) {
    // console.log(el.name);
    var answerId = getElIdx(el);
    var question = paper[answerId];
    var answers = getAnswer(answerId).answer.length
      ? getAnswer(answerId).answer.split('、')
      : 0;
    var ans_len = answers ? answers.length : 0;

    var max = question.length ? question.length : 1;
    // console.log(question, answers,'.',ans_len,'.',question.length,max);

    // 判断是否选了最后一项
    if (max > 1) {
      // 最后一个答案
      var lastAnswer = answers[answers.length - 1];
      // 最后一个选项
      var lastOption = alphaList[question.data.length - 1];

      $textarea = getTextAreaById(answerId);
      if (lastAnswer == lastOption) {
        // 如果选了最后一项,显示textarea，同时获取焦点
        $textarea.show().focus();
      } else {
        clearTextArea(answerId);
        $textarea.hide();
      }
      console.log(lastAnswer, lastOption);
    }

    var $errDom = $('.item[data-idx=' + answerId + ']').find('.hasErr');

    if (ans_len >= max) {
      $errDom.show();
      lockCheckbox(answerId);
    } else {
      $errDom.hide();
      unlockCheckbox(answerId);
    }

    // console.log(ans_len,max)
    return ans_len >= 1 && ans_len <= max;
  }

  function getTextAreaById(answerId) {
    return $('.item[data-idx=' + answerId + ']').find('textarea');
  }

  function bindEvent() {
    $('input[type="checkbox"]').each(function(i, el) {
      $(el).change(function(e) {
        // var target = e.target;
        // console.log(target, target.type, target.checked);
        validate(e.target);
      });
    });

    // textarea 失去焦点事件处理
    $('textarea').on('blur', function(e) {
      var answerId = getElIdx(e.target);
      var answer = getAnswer(answerId);
      console.log(answer);

      var isLastQuestion = answerId == paper.length - 1;

      // 最后一道题目无内容
      var noContent = answer.answer.trim().length == 0 && isLastQuestion;

      // 备注题目无内容
      noContent =
        noContent || (answer.remark.trim().length == 0 && !isLastQuestion);

      // 如果textarea失去焦点时，内容为空，重新获取焦点
      if (noContent) {
        $textarea = getTextAreaById(answerId);
        $textarea.focus();
      }
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
    var params = { start_time: start_time, ip: ip, company_id: 1 },
      remark = { start_time: start_time, ip: ip, company_id: 1 };

    var paperLen = paper.length;

    for (var i = 0; i < paperLen; i++) {
      var res = renderLib.getAnswer(i);
      params['remark_' + (i + 1)] = res.answer;
      remark['remark_' + (i + 1)] = res.remark;
    }
    return { params: params, remark: remark };
  };

  function addData(data) {
    $.get(url + '596/fadd053a8f').then(function(res) {
      console.log(res);
    });
  }

  return {
    // getCheckbox: getCheckbox,
    // getRadio: getRadio,
    // getTextarea: getTextarea,
    initHtml: initHtml,
    getAnswer: getAnswer,
    bindEvent: bindEvent,
    getParams: getParams,
    validate: validate
  };
})();

$(function() {
  var ip = '';

  $.get(url + '/api/ip').then(function(res) {
    ip = res.ip;
    console.log(ip);
  });

  var html = renderLib.initHtml();
  $('#paper-wrap').html(html);
  renderLib.bindEvent();

  $('#submit').on('click', function() {
    var data = renderLib.getParams(ip);
    let vali = true;
    for (let i = 0; i < 47; i++) {
      vali = renderLib.validate(i);
      if (!vali) {
        break;
      }
    }
    console.log(data, vali);
    if (!vali) {
      window.alert('请按要求完成答题再提交');
    }
  });
});
