$.getJSON( "https://solo-json-server.herokuapp.com/imoveis", function( data ) {
  var items = {};
  $.each( data, function( key, val ) {
    //console.log(val);
    var city = val.local.cidade.replace('/SP', '')
    var city = city.replace('CAMPINAS', 'Campinas');
    var city = city.replace('Sumare', 'Sumaré');
    var city = city.replace('Paulinia', 'Paulínia');
    var city = city.replace('Hortolandia', 'Hortolândia');
    if(items.hasOwnProperty(city)) {
      if(!items[city]) items[city] = [];
      checkAndAdd(items, val.local.bairro, city, val.finalidade);
    } else {
      items[city] = [];
      checkAndAdd(items, val.local.bairro, city, val.finalidade);
    }
  });

  _.each(_.keys(items), function(el){


    if (items[el].length === 0) {
      delete items[el]
    }
  });
  console.log(JSON.stringify(items));
});

function checkAndAdd(items, bairro, city, checker) {
  if(!items[city].includes(bairro) && checker === 'residencial' && bairro !== '')
    items[city].push(bairro);

}
