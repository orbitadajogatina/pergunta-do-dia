'use strict';

const { createClient } = require('@supabase/supabase-js');

const database = createClient('https://onlntxblavzgsutdbson.supabase.co', process.env.SUPABASE_TOKEN);

function getDatabase() {
    return database;
}

module.exports = { getDatabase };
