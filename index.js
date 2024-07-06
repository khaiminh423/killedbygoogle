const [searchInput, filterSelect, gridCont] = document.querySelectorAll('#grid-cont,#search-input,#filter-select');
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


const h = (tag, props, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}
//------------------------------------ SELECT OPTIONS --------------------------------------------
const renderOption = (value, textContent) =>
  h('option', { value }, textContent);

const renderSelect = (grave) => 
  filterSelect.append(renderOption('any', `All (${grave.length})`), ...Object.entries(Object.groupBy(grave, (item) => item.type)).map(([type, items]) => renderOption(type, `${type} (${items.length})`)));


//----------------------------------------- GRID -------------------------------------------------
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const renderGrid = (grave, keyword = '', type = 'any') => {
  const graveStones = grave
    .filter((stone) => 
      (stone.name.toLowerCase().includes(keyword) || stone.description.toLowerCase().includes(keyword)) 
      && (type === 'any' || stone.type === type)
    ).map((stone) => {
      const itemDate = new Date(stone.dateClose);
      const itemAge = humanDistance(new Date(stone.dateOpen), itemDate);
      const isFuture = itemDate > Date.now();
      const killedText = isFuture ? `${randomPhrase()} ${relative.format(...itemAge)}` : `Killed about ${relative.format(...itemAge)}`;
        return (
          h('div', { className: 'grid-item' },
            h('div', { className: 'item-left' }, 
              h('img', { 
                height: 50, 
                src: `img/${isFuture ? 'guillotine.svg' : 'tombstone.svg'}`, 
                alt: ''
              }), 
              h('div', { className: 'item-time' }, 
                isFuture 
                ? itemDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '\n')
                : `${stone.dateOpen.split('-')[0]} - ${stone.dateClose.split('-')[0]}`
              ), 
              h('div', { className: 'item-tag'}, stone.type)
            ),
            h('div', { className: 'item-right' },
              h('h2', { className: 'item-title' }, 
                h('a', { href: stone.link, target: '_blank'}, stone.name)
              ),
              h('div', { className: 'item-desc' }, 
                `${killedText}, ${stone.description}. ${isFuture ? 'It will be' : 'It was'} ${Math.abs(itemAge[0])} ${itemAge[1]}${Math.abs(itemAge[0]) === 1 ? '' : 's'} old.`)
            )
          )
        )
    })

  gridCont.replaceChildren(h('div', { className: 'ad' }), ...graveStones);
}
//------------------------------------------------------------------------------------------------


const changeFilter = (cacheData) => {
  const keyword = searchInput.value.toLowerCase();
  const type = filterSelect.value;
  renderGrid(cacheData, keyword, type);
}

const humanDistance = (dateCompare) => {
  const delta = dateCompare.getTime() - Date.now();
  if (Math.abs(delta) < MONTH)
    return [delta / DAY | 0, 'day'];
  if (Math.abs(delta) < YEAR)
    return [delta / MONTH | 0, 'month'];
  return [delta / YEAR | 0, 'year'];
}


const res = await fetch('data/graveyard.json');

if (res.ok) {
  const cacheData = (await res.json()).sort((a, b) => new Date(b.dateClose).getTime() - new Date(a.dateClose).getTime());
  renderGrid(cacheData);
  renderSelect(cacheData);
  const change = changeFilter.bind(null, cacheData);
  searchInput.addEventListener('input', change);
  filterSelect.addEventListener('change', change);
} else {
  gridCont.append(h('div', { style: { textAlign: 'center' } }, 'Network error'));
}