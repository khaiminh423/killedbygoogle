const gridCont = document.querySelector('#grid-cont');
const searchInput = document.querySelector('#search-input');
const filterSelect = document.querySelector('#filter-select');
const phrases = [
  'Sentenced to death',
  '"Off with their heads!"',
  'Kicking the bucket',
  'Dead as a doorknob',
  'Done for',
  'Expiring',
  'Biting the big one',
  'Off to the glue factory',
  'Another one bites the dust',
  'To be turned off',
  'Like a fork stuck in the outlet',
  'Scheduled to be killed',
  'To be exterminated',
  'To be flushed',
  'Getting unplugged',
  'Vanishing',
  'Going poof',
  'Turning to ashes',
  "Getting KO'd",
  'Running out of juice',
  'Fading into darkness',
  'Floating belly up'
];
const MINUTE = 60000,
  HOUR = MINUTE * 60,
  DAY = HOUR * 24,
  MONTH = DAY * 30.4167, //good enough
  YEAR = MONTH * 12;

const randomPhrase = () => phrases[(Math.random() * phrases.length) | 0];
let cacheData = [];

/*
    I SEPARATE THE DATA ONLY FOR CONVENIENCE,
    INCLUDE THIS DATA SERVER SIDE WITH HTML IF WANT BETTER PERFORMANCE & RELIABILITY
    */

const res = await fetch('data/graveyard.json');

if (res.ok) {
  cacheData = (await res.json()).sort((a, b) => a.dateClose - b.dateClose);
  renderGrid(cacheData);
  renderSelect(cacheData);
} else {
  gridCont.append(h('div', { style: {textAlign: 'center'} },'Network error'));
}

function h(tag, props, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}
//------------------------------------ SELECT OPTIONS --------------------------------------------
function renderOption(value, textContent) {
  return h('option', { value }, textContent);
}
function renderSelect(grave) {
  const types = Object.groupBy(grave, (item) => item.type);
  filterSelect.append(renderOption('any', `All (${grave.length})`), ...Object.entries(types).map(([type, items]) => renderOption(type, `${type} (${items.length})`)));
}

//----------------------------------------- GRID -------------------------------------------------
function renderGrid(grave, keyword = '', type = 'any') {
  const now = new Date();
  const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const graveStones = grave
    .filter((stone) => (stone.name.toLowerCase().includes(keyword) || stone.description.toLowerCase().includes(keyword)) && (type === 'any' || stone.type === type))
    .map((stone) => {
      const itemDate = new Date(stone.dateClose);
      const itemAge = humanDistance(new Date(stone.dateOpen), itemDate);
      if (itemDate > now)
        return {
          stone,
          dateFormatted: itemDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '\n'),
          image: 'guillotine.svg',
          killedText: `${randomPhrase()} ${relative.format(...humanDistance(itemDate))}`,
          ageText: 'It will be',
          itemAge
        };
      return {
        stone,
        dateFormatted: `${stone.dateOpen.split('-')[0]} - ${stone.dateClose.split('-')[0]}`,
        image: 'tombstone.svg',
        killedText: `Killed about ${relative.format(...humanDistance(itemDate))}`,
        ageText: 'It was',
        itemAge
      };
    })
    .map((data) =>
      h('div', { className: 'grid-item' },
        h('div', { className: 'item-left' }, 
          h('img', { height: 50, src: `img/${data.image}`, alt: '' }), 
          h('div', { className: 'item-time' }, data.dateFormatted), 
          h('div', { className: 'item-tag'}, data.stone.type)
        ),
        h('div', { className: 'item-right' },
          h('h2', { className: 'item-title' }, 
            h('a', { href: data.stone.link, target: '_blank'}, data.stone.name)
          ),
          h('div', { className: 'item-desc' }, `${data.killedText}, ${data.stone.description}. ${data.ageText} ${Math.abs(data.itemAge[0])} ${data.itemAge[1]}${data.itemAge[0] === 1 ? 's' : ''} old.`)
        )
      )
    );

  gridCont.append(h('div', { className: 'ad' }), ...graveStones);
}
//------------------------------------------------------------------------------------------------

searchInput.addEventListener('keyup', changeFilter);
filterSelect.addEventListener('change', changeFilter);
function changeFilter() {
  const keyword = searchInput.value.toLowerCase();
  const type = filterSelect.value;

  renderGrid(cacheData, keyword, type);
}

function humanDistance(dateCompare) {
  let delta = dateCompare.getTime() - Date.now();
  if (Math.abs(delta) < MONTH)
    return [delta / DAY | 0, 'day'];
  if (Math.abs(delta) < YEAR)
    return [(delta / MONTH) | 0, 'month'];
  return [delta / YEAR | 0, 'year'];
}
