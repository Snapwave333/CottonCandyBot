try {
  require.resolve('tailwindcss');
  console.log('tailwindcss found');
} catch (e) {
  console.error('tailwindcss NOT found');
}

try {
  require.resolve('autoprefixer');
  console.log('autoprefixer found');
} catch (e) {
  console.error('autoprefixer NOT found');
}
