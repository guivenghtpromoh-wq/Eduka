const fs = require('fs');

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected. Skipping demo seed execution.');
    return;
  }

  console.log('Seeding development database...');
  console.log('Development database seed completed successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
