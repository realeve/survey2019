$(function() {
  var url = 'http://api.cbpc.ltd/';
  var ip = '';

  console.log(paper);
  $.get(url + 'ip').then(function(res) {
    console.log(res);
    ip = res.ip;
  });

  function renderSelector(data) {
    var html =
      '\
    <select class="form-control">\
      <option>1</option>\
      <option>2</option>\
      <option>3</option>\
      <option>4</option>\
      <option>5</option>\
    </select>';
    return html;
  }
});
