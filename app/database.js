'use strict';

const { createClient } = require('@supabase/supabase-js');

const database = createClient('https://onlntxblavzgsutdbson.supabase.co', process.env.SUPABASE_TOKEN);

function initializeDatabase() {
    global.database = database;
}

module.exports = { initializeDatabase };
