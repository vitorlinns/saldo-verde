const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const MIGRATION_FILE = path.resolve(__dirname, 'sql/001_init_auth_schema.sql');

const parseStatements = (sql) => {
  const statements = [];
  let current = '';
  let state = 'normal';
  let dollarTag = null;

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) {
      statements.push(trimmed);
    }
    current = '';
  };

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (state === 'normal') {
      if (char === '-' && next === '-') {
        state = 'line_comment';
        current += char;
      } else if (char === '/' && next === '*') {
        state = 'block_comment';
        current += char;
      } else if (char === "'") {
        state = 'single_quote';
        current += char;
      } else if (char === '"') {
        state = 'double_quote';
        current += char;
      } else if (char === '$') {
        const match = sql.slice(i).match(/^(\$[A-Za-z0-9_]*\$)/);
        if (match) {
          dollarTag = match[1];
          state = 'dollar_quote';
          current += dollarTag;
          i += dollarTag.length - 1;
        } else {
          current += char;
        }
      } else if (char === ';') {
        current += char;
        flush();
      } else {
        current += char;
      }
    } else if (state === 'line_comment') {
      current += char;
      if (char === '\n') {
        state = 'normal';
      }
    } else if (state === 'block_comment') {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        state = 'normal';
      }
    } else if (state === 'single_quote') {
      current += char;
      if (char === "'") {
        if (next === "'") {
          current += next;
          i += 1;
        } else {
          state = 'normal';
        }
      }
    } else if (state === 'double_quote') {
      current += char;
      if (char === '"') {
        state = 'normal';
      }
    } else if (state === 'dollar_quote') {
      current += char;
      if (sql.startsWith(dollarTag, i)) {
        current += sql.slice(i + 1, i + dollarTag.length);
        i += dollarTag.length - 1;
        state = 'normal';
        dollarTag = null;
      }
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
};

const runStatement = (statement, target) => {
  const tempFile = path.join(os.tmpdir(), `supabase-migrate-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  fs.writeFileSync(tempFile, statement + os.EOL, 'utf8');

  try {
    console.log(`Running ${target} statement...`);
    execFileSync('npx', ['supabase', 'db', 'query', `--${target}`, '--file', tempFile], {
      cwd: __dirname,
      stdio: 'inherit',
    });
  } finally {
    fs.unlinkSync(tempFile);
  }
};

const main = () => {
  const args = process.argv.slice(2);
  let targets = ['local', 'linked'];

  if (args.includes('--local') && !args.includes('--linked')) {
    targets = ['local'];
  }
  if (args.includes('--linked') && !args.includes('--local')) {
    targets = ['linked'];
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  const statements = parseStatements(sql);

  console.log(`Parsed ${statements.length} SQL statements from ${MIGRATION_FILE}`);

  for (const target of targets) {
    console.log(`\n=== Applying migration to ${target} database ===`);
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      runStatement(trimmed, target);
    }
  }
};

main();
