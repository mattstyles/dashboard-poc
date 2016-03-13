
export default function def( key, value ) {
  return process.env[ key ] || process.env[ 'npm_package_config_' + key.toLowerCase() ] || value
}
