let api = {
    total:'http://10.8.1.25:100/599/7318236484',
    group:'http://10.8.1.25:100/600/38f12aabc9'
}

/**
 *   @database: { weixin }
 *   @desc:     { 总公司企业活力评估问卷总数 } 
 */
const getTotal = () => {
    let total = 0;
    $.ajax({
        url:api.total,
        async: false
    }).done(res => {
        // console.log(res.data);
        total = res.data[0].total
    });
    return total;
}
  
/**
 *   @database: { weixin }
 *   @desc:     { 总公司企业活力评估问卷地址分组统计 } 
 */
const getGroup = () => {
    let total = 0;
    $.ajax({
        url:api.group,
        async: false
    }).done(res => {
        // console.log(res.data);
        total = res.data
    });
    return total;
}

const getData = () => {
    let total = getTotal();
    let group = getGroup();

    return {total,group};
}

const render = ({total,group}) => {
    $('#stastic-total').text(total);
    let html = '';
    group.forEach( e => {
        let qualified = 0;
        try{
            qualified = eval(e.total)>=0.9;
        }catch(e){}
        html += `<div class="col-md-12"><span class="col-ip">${e['IP地址']}：</span><span class="num${qualified?'':' unqualified'}">${e.total}</span></div>`;
    });
    $('#groupTotal').html('');
    $('#app > div:nth-child(2)').fadeIn('slow',function(){
        $('#groupTotal').html(html);
    })

}

const reRender = () => {
    let data = getData();
    render(data);
}
const init = () => {
    setInterval(() => {
        reRender();
    }, 10000);
}
reRender();
init();