var url = 'http://10.8.1.25:100/';
var DEV = false;
var ISOK = false;
var PWD_VALIDATED = false;
var isJQ = false;
var ip = '';
try {
  new ActiveXObject("Microsoft.XMLHTTP");
} catch (e) {
  isJQ = true;
}

function get(setting, callback) {
  if(DEV){
    callback({ip:'127.0.0.1',serverTime:'0000-00-00 00:00:00'});
  }
  if (isJQ) {
    $.get(setting.url, callback);
  } else {
    // alert('!isJQ');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        callback($.parseJSON(this.responseText));
      }
    };

    xhr.open("GET", setting.url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
  }
}

function post(setting, callback) {
  if (isJQ) {
    $.post(setting, callback);
  } else {
    // var data = qs.stringify(setting.data);

    var formData = '';
    var data = setting.data;
    formData += 'id=' + data.id + '&' + 'nonce=' + data.nonce;
    var values = data.values[0];
    // console.log(values);
    formData += '&values[0][uuid]=' + values.uuid + '&values[0][start_time]=' + values.start_time 
                + '&values[0][ip]=' + values.ip + '&values[0][company_id]=1&values[0][batch]='+values.company;
    for (var i = 0; i < 47; i++) {
      var v = values['remark_' + (i + 1)];
      formData += '&values[0][remark_' + (i + 1) + ']=' + (v ? v : '');
    }
    // console.log('formdata', encodeURI(formData));
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        callback($.parseJSON(this.responseText));
      }
    };

    xhr.open("POST", setting.url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(encodeURI(formData));
  }
}

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
      <input type="checkbox" ' + (DEV && i === 0 ? ' checked ' : '') + 'value="' +
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
      '"   id="q-' + idx + '">\
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
      <input type="radio" ' + (DEV && i === 0 ? ' checked ' : '') + 'value="' +
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
      '"  id="q-' + idx + '">\
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
      '<div class="item row" id="q-' + idx + '">\
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
    var els = $('[data-idx=' + id + '] input[type="checkbox"]');
    for (var i = 0; i < els.length; i++) {
      if (!els[i].checked) {
        $(els[i]).attr('disabled', 'true');
      }
    }
  }

  function unlockCheckbox(id) {
    // console.log('unlock',id )
    var els = $('[data-idx=' + id + '] input');
    for (var i = 0; i < els.length; i++) {
      $(els[i]).removeAttr('disabled');
    }
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
  function validate(el, moveto) {
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
    if (question.showOther) {
      // 最后一个答案
      var lastAnswer = answers[answers.length - 1];
      // 最后一个选项
      var lastOption = alphaList[question.data.length - 1];

      $textarea = getTextAreaById(answerId);
      if (lastAnswer == lastOption) {
        // 如果选了最后一项,显示textarea，同时获取焦点
        if ($textarea.val().length === 0) {
          $textarea.show().focus();
        }
      } else {
        clearTextArea(answerId);
        $textarea.hide();
      }
      // console.log(lastAnswer, lastOption);
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
    var rs = ans_len >= 1 && ans_len <= max;
    if (moveto && !rs) {
      $($('#q-' + el + ' input')[0]).focus();
    }
    return rs;
  }

  function getTextAreaById(answerId) {
    return $('.item[data-idx=' + answerId + ']').find('textarea');
  }

  function bindEvent() {
    var els = $('input[type="checkbox"],input[type="radio"]');
    for (var i = 0; i < els.length; i++) {
      $(els[i]).change(function (e) {
        // var target = e.target;
        // console.log(target, target.type, target.checked);
        validate(e.target);
      });
    }

    // textarea 失去焦点事件处理
    $('textarea').on('blur', function (e) {
      var answerId = getElIdx(e.target);
      var answer = getAnswer(answerId);
      // console.log(answer);

      var isLastQuestion = answerId == paper.length - 1;

      // 最后一道题目无内容
      var noContent = answer.answer.length == 0 && isLastQuestion;

      // 备注题目无内容
      noContent =
        noContent || (answer.remark.length == 0 && !isLastQuestion);

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
        .replace(/\r/g, '')
        .replace(/\n/g, '。');
    }

    switch (type) {
      case 'radio':
        answer = $('[name="radio' + idx + '"]:checked').val();
        break;
      case 'checkbox':
        var arr = [];
        var els = $('[name="checkbox' + idx + '"]:checked');
        for (var i = 0; i < els.length; i++) {
          arr[i] = $(els[i]).val();
        }
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

  function getUUID() {
    var uuid = '';
    for (var i = 0; i < 16; i++) {
      uuid += alphaList[parseInt(Math.random() * alphaList.length)];
    }
    return uuid;
  }

  var getParams = function () {
    var company = $('#company').val();
    if(company == '0'){
      $('#company').focus();
      alert('请选择单位');
      return false;
    }
    var start_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    var uuid = getUUID();
    var params = { uuid: uuid, start_time: start_time, ip: PWD_VALIDATED?company:ip, company_id: 1,batch:company },
      remark = { uuid: uuid, start_time: start_time, ip: PWD_VALIDATED?company:ip, company_id: 1 };

    var paperLen = paper.length;

    for (var i = 0; i < paperLen; i++) {
      var res = renderLib.getAnswer(i);
      params['remark_' + (i + 1)] = res.answer;
      remark['remark_' + (i + 1)] = res.remark;
    }
    return { params: params, remark: remark };
  };

  function addData(data) {
    // console.log('adddata');
    post({ url: url, data: { id: 596, nonce: 'fadd053a8f', values: [data.params] } }, function (res) {
      // console.log(res);
      // alert(1);
    });
    post({ url: url, data: { id: 598, nonce: '8ef0b5d673', values: [data.remark] } }, function (res) {
      // console.log(res);
      // alert(2);
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
    validate: validate,
    addData: addData
  };
})();

function vld_pwd(evt){
  var vld = false;
  try{
    vld = atob(evt.value) == "¥«,ÃJÝ";
  }catch(e){}
  if(vld){
    PWD_VALIDATED = true;
    $('#mask').hide();
    // DEV = true;
    init();
    $('#submit').removeAttr('disabled');
  }else{
    evt.value = '';
    $(evt).focus();
  }
}

function input_pwd(evt){
  var pwd = evt.value;
  if(pwd.length == 8){
    vld_pwd(evt);
  }
}

function init() {
  get({ url: url + 'ip' }, function (res) {
    ip = res.ip;
    ISOK = PWD_VALIDATED || DEV || dayjs(res.serverTime).isAfter('2019-07-04 13:50:00') && dayjs(res.serverTime).isBefore('2019-07-05 16:00:00');

    if (!ISOK) {
      $('#submit').attr('disabled', true);
      $('#mask').show();
      $('#pwd').focus();
      // alert('问卷通道关闭');

      $('#paper-wrap').html('<div style="color:red;font-size:30pt;text-align:center;">问卷通道关闭</div>');
    } else {

      var html = renderLib.initHtml();
      $('#paper-wrap').html(html);
      renderLib.bindEvent();

      $('#submit').unbind('click');
      $('#submit').on('click', function () {
        var data = renderLib.getParams(ip);
        if(!data){
          return;
        }
        var vali = true;
        for (var i = 0; i < 46; i++) {
          vali = renderLib.validate(i, true);
          if (!vali) {
            break;
          }
        }
        // console.log(data, vali);
        if (!vali) {
          window.alert('请按要求完成答题再提交');
          return false;
        }

        try {
          renderLib.addData(data);
          $('#submit').attr('disabled', true);
          alert('答案已提交，请关闭页面。');
        } catch (e) {
          // console.log(e);
          alert('报错了，请手动刷新再次填写。如果是多次报错，请联系组办方。');
        }
      });
    }
  });


};
