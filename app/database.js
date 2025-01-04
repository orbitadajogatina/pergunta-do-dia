'use strict';

const { createClient } = require('@supabase/supabase-js');

const database = createClient('https://onlntxblavzgsutdbson.supabase.co', process.env.SUPABASE_TOKEN);

function getDatabase() {
    global.database = database;
}

module.exports = { getDatabase };
