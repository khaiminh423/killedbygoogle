document.addEventListener('DOMContentLoaded', function(){
    const gridCont = document.getElementById('grid-cont');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const phrases = [
        "Sentenced to death",
        '"Off with their heads!"',
        "Kicking the bucket",
        "Dead as a doorknob",
        "Done for",
        "Expiring",
        "Biting the big one",
        "Off to the glue factory",
        "Another one bites the dust",
        "To be turned off",
        "Like a fork stuck in the outlet",
        "Scheduled to be killed",
        "To be exterminated",
        "To be flushed",
        "Getting unplugged",
        "Vanishing",
        "Going poof",
        "Turning to ashes",
        "Getting KO'd",
        "Running out of juice",
        "Fading into darkness",
        "Floating belly up"
    ];
    var cacheData = false;

    /*
    I SEPARATE THE DATA ONLY FOR CONVENIENCE,
    INCLUDE THIS DATA SERVER SIDE WITH HTML IF WANT BETTER PERFORMANCE & RELIABILITY
    */
    var x = new XMLHttpRequest();
    x.open("GET", 'data/graveyard.json');
    x.onloadend = function () {
        if (x.status === 200) {
            cacheData = JSON.parse(x.responseText);
            renderGrid(cacheData);
            renderSelect(cacheData);
        }else{
            gridCont.innerHTML = '<div style="text-align:center">Network error</div>';
        }
        gridCont.style.minHeight = '0';
    };
    x.send();

    //------------------------------------ SELECT OPTIONS --------------------------------------------
    function renderSelect(grave){
        var selectHTML = '<option value="any">All ('+grave.length+')</option>';
        var types = {};
        for(var i = 0; i < grave.length; i++){
            if(types[grave[i].type]){
                types[grave[i].type] += 1;
            }else{
                types[grave[i].type] = 1;
            }
        }
        var typeName = Object.keys(types);
        for(var i = 0; i < typeName.length; i++){
            selectHTML += `<option value="${typeName[i]}">${typeName[i]}s (${types[typeName[i]]})</option>`;
        }
        filterSelect.innerHTML = selectHTML;
    }

    //----------------------------------------- GRID -------------------------------------------------
    function renderGrid(grave, keyword = '', type = 'any'){
        var now = new Date();
        var gridHTML = '', killedText, ageText, dateFormatted, image;

        gridHTML += '<div class="ad"></div>';

        //SORT BY RECENT KILL DATE
        grave.sort(function(a, b){
            return (a.dateClose > b.dateClose) ? -1 : 1;
        });

        for (var i = 0; i < grave.length; i++) {
            if(keyword !== '' && grave[i].name.toLowerCase().indexOf(keyword) === -1 
                              && grave[i].description.toLowerCase().indexOf(keyword) === -1){
                continue;
            }
            if(type !== 'any' && grave[i].type !== type){
                continue;
            }

            var itemDate = new Date(grave[i].dateClose);
            var itemAge = humanDistance(new Date(grave[i].dateOpen), itemDate);

            if(itemDate > now){
                dateFormatted = itemDate.toLocaleString('en-US', {month:'long', year:'numeric'}).replace(' ', '<br>');
                image = 'guillotine.svg';
                killedText = phrases[Math.floor(Math.random() * phrases.length)] + ' in ' + humanDistance(now, itemDate);
                ageText = 'It will be';
            
            }else{
                dateFormatted = grave[i].dateOpen.split('-')[0] + ' - ' + grave[i].dateClose.split('-')[0];
                image = 'tombstone.svg';
                killedText = 'Killed about ' + humanDistance(itemDate, now) + ' ago';
                ageText = 'It was';
            }

            gridHTML += `<div class="grid-item">
                <div class="item-left">
                    <img height="50" alt="" src="img/${image}">
                    <div class="item-time">${dateFormatted}</div>
                    <div class="item-tag">${grave[i].type}</div>
                </div>
                <div class="item-right">
                    <h2 class="item-title">
                        <a href="${grave[i].link}" target="_blank">${grave[i].name}</a>
                    </h2>
                    <div class="item-desc">
                        ${killedText}, ${grave[i].description}. ${ageText} ${itemAge} old.
                    </div>
                </div>
            </div>`;
        }

        gridCont.innerHTML = gridHTML;
    }
    //------------------------------------------------------------------------------------------------

    searchInput.addEventListener('keyup', changeFilter);
    filterSelect.addEventListener('change', changeFilter);
    function changeFilter(){
        if(!cacheData){
            return;
        }
        var keyword = searchInput.value.toLowerCase();
        var type = filterSelect.value;

        renderGrid(cacheData, keyword, type);
    }

    function humanDistance(dateFrom, dateTo){
        var delta = Math.abs(dateTo.getTime() - dateFrom.getTime());
        var unit = '';
        var minute = 60000,
            hour = minute * 60,
            day = hour * 24,
            month = day * 30.4167,   //good enough
            year = month * 12;

        if(delta < day){
            return "less than a day";
        }

        if(delta < month){
            delta /= day;
            unit = " day";
        }else if(delta < year){
            delta /= month;
            unit = " month";
        }else{
            delta /= year;
            unit = " year";
        }

        delta = Math.floor(delta);
        if(delta > 1){
            unit += 's';
        }
        return delta + unit;
    }

    if('serviceWorker' in navigator){
        navigator.serviceWorker.register('sw.js');
    }
});