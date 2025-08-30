exports.up = function(knex) {
  return knex.schema.createTable('cabs', table => {
    table.increments('id').primary();
    table.string('driver_name').notNullable();
    table.string('vehicle_no').unique().notNullable();
    table.enum('status', ['available', 'on_trip', 'offline']).notNullable().defaultTo('available');
    table.float('lat');
    table.float('lon');
    table.timestamp('last_update').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cabs');
}; 