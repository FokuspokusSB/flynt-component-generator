<?php

namespace Flynt\Components\<component_name>;

use Flynt\Utils\Options;
// use Flynt\FieldVariables;

add_filter('Flynt/addComponentData?name=<component_name>', function ($data) {
  return $data;
});

function getACFLayout()
{
  return [
    'name' => '<component_name>',
    'label' => '<component_name>',
    'sub_fields' => [
      [
        'label' => 'ID',
        'name' => 'id',
        'type' => 'text'
      ],
    ]
  ];
}

Options::addTranslatable('<component_name>', [

]);
