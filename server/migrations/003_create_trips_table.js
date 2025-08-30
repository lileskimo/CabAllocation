exports.up = function(knex) {
  return knex.schema.createTable('trips', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('cab_id').unsigned().references('id').inTable('cabs').onDelete('SET NULL');
    table.float('pickup_lat').notNullable();
    table.float('pickup_lon').notNullable();
    table.float('dest_lat');
    table.float('dest_lon');
    table.enum('status', ['requested', 'assigned', 'enroute', 'ongoing', 'completed', 'cancelled']).notNullable().defaultTo('requested');
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('assigned_at');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.integer('est_distance_meters');
    table.integer('est_duration_seconds');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('trips');
}; 