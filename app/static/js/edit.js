$(function () {  
    $("#filter, #order, input[name='filter-scope'], input[name='order-column'], input[name='order-orientation']").change(function(){
        refreshWithNewSettings();
    });
    $('#skip-page').click(nextPage);
    $('#remove-all').click(removeAll);
    $('#keep-all').click(keepAll);
    $('#submit').click(submit);
    $('#start-over').click(startOver);
})

function refreshWithNewSettings(filter, filterScope, order, orderColumn, orderOrientation){
    filter = $('#filter').find(":selected").val();
    filterScope = $("input[name='filter-scope']").filter(':checked').attr('id')
    order = $('#order').find(":selected").val();
    orderColumn = $("input[name='order-column']").filter(':checked').attr('id')
    orderOrientation = $("input[name='order-orientation']").filter(':checked').attr('id')
    settings = {
        'filter': filter,
        'filter_scope': filterScope,
        'order': order,
        'order_col': orderColumn,
        'order_orientation': orderOrientation
    }
    action = 'new_settings'
    data = {'action': action, 'settings': settings}
    $.post("/edit", JSON.stringify(data))
        .done(function (response) {
            handleResponse(response)
        });
}

function handleResponse(response){
    response = JSON.parse(response)
    if ('options' in response){
        applyOptions(response.options)
    }
    writeTable(response.df, response.showing_from)
    updateShowingInfo(response.showing_from, response.showing_to, response.showing_total)
}

function writeTable(dfAsJson, showingFrom) {
    dfAsJson = JSON.parse(dfAsJson)
    console.log(dfAsJson)
    tableBody = $('#data-table').find('tbody')
    // Empty table
    tableBody.empty();
    // Append new rows
    let count = showingFrom + 1;
    for (const row of dfAsJson) {
        newRow = $("<tr>")
        newRow.append($(`<th>${count}</th>`))
        newRow.append($(`<td class="index">${row.index}</td>`))
        newRow.append($(`<td class="source" contenteditable="true">${row.source}</td>`))
        newRow.append($(`<td class="target" contenteditable="true">${row.target}</td>`))
        tableBody.append(newRow);
        count += 1;
    }
    tableBody.find('th,td.index').click(function () { toggleRow($(this).parent()) })
    updateNumSelected();
}


function updateShowingInfo(showingFrom, showingTo, showingTotal) {
    $('#showing-from').text(showingFrom + 1);
    $('#showing-to').text(showingTo + 1);
    $('#showing-total').text(showingTotal);
    lastPage = Boolean(showingTo + 1 == showingTotal)
}

function nextPage() {
    action = 'next_page'
    data = { 'action': action }
    $.post("/edit", JSON.stringify(data))
        .done(function (response) {
            handleResponse(response);
        });
}

function applyOptions(options){
    $('#filter-scope').toggle(!options.filter_scope_disabled)
    $('#order-col').toggle(!options.order_col_disabled)
}

function toggleRow($row){
    $row.toggleClass('table-secondary');
    updateNumSelected();
}

function keepAll(){
    $('tbody').find('tr').removeClass('table-secondary');
    updateNumSelected();
}

function removeAll(){
    $('tbody').find('tr').addClass('table-secondary');
    updateNumSelected();
}

function updateNumSelected(){
    $('#num-selected').text($('tr.table-secondary').length)
}

function submit(){
    // Get indices of selected rows
    let remove = [];
    $('tbody').find('tr.table-secondary').find('td.index').each(function(){
        remove.push(parseInt($(this).text()));
    })
    let update = {}
    $('tbody').find('tr:not(.table-secondary)').each(function(){
        let idx = parseInt($(this).find('td.index').text());
        let source = $(this).find('td.source').text()
        let target = $(this).find('td.target').text()
        update[idx] = [source, target]
    })
    action = 'submit'
    data = {'action': action, 'remove': remove, 'update': update}
    $.post("/edit", JSON.stringify(data))
        .done(function (response) {
            handleResponse(response);
        });
}

function startOver(){
    data = { 'action': 'start_over'}
    $.post("/edit", JSON.stringify(data))
        .done(function (response) {
            handleResponse(response);
        });
}