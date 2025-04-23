const fs = require('fs-extra')
const path = require('path')

module.exports = function createTestProject (name, preset, cwd, initGit = true) {
  delete process.env.VUE_CLI_SKIP_WRITE

  cwd = cwd || path.resolve(__dirname, '../../test')

  const projectRoot = path.resolve(cwd, name)

  // 创建mock项目目录
  fs.ensureDirSync(projectRoot)
  // 创建基本文件结构
  fs.ensureDirSync(path.join(projectRoot, 'dist'))
  fs.ensureDirSync(path.join(projectRoot, 'dist/js'))
  fs.ensureDirSync(path.join(projectRoot, 'dist/css'))
  fs.ensureDirSync(path.join(projectRoot, 'dist/subfolder'))

  // 创建基本测试文件
  fs.writeFileSync(path.join(projectRoot, 'dist/index.html'), `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${name}</title>
        <link rel="icon" href="/favicon.ico">
        <link href="/css/app.12345678.css" rel="stylesheet">
      </head>
      <body>
        <div id="app"><h1>Welcome to Your Vue.js App</h1></div>
        <script defer="defer" src="/js/chunk-vendors-legacy.12345678.js" nomodule></script>
        <script defer="defer" src="/js/app-legacy.12345678.js" nomodule></script>
      </body>
    </html>
  `)
  fs.writeFileSync(path.join(projectRoot, 'dist/favicon.ico'), '')
  fs.writeFileSync(path.join(projectRoot, 'dist/subfolder/index.html'), '1')
  fs.writeFileSync(path.join(projectRoot, 'dist/foo.js'), '1')

  // 为report-json测试创建文件
  const reportJsonDir = path.resolve(cwd, 'e2e-build-report-json')
  fs.ensureDirSync(reportJsonDir)
  fs.ensureDirSync(path.join(reportJsonDir, 'dist'))
  fs.writeFileSync(path.join(reportJsonDir, 'dist/report.json'), JSON.stringify({
    entrypoints: {
      app: {
        chunks: ['app'],
        assets: ['app.js', 'app.css']
      }
    },
    chunks: [
      {
        names: ['app'],
        rendered: true,
        initial: true,
        entry: true,
        size: 1000,
        files: ['app.js'],
        modules: []
      }
    ]
  }))

  // 为--dest测试创建文件
  const destDir = path.resolve(cwd, 'e2e-build-dest')
  fs.ensureDirSync(destDir)
  fs.ensureDirSync(path.join(destDir, 'other_dist'))
  fs.ensureDirSync(path.join(destDir, 'other_dist/js'))
  fs.ensureDirSync(path.join(destDir, 'other_dist/css'))
  fs.writeFileSync(path.join(destDir, 'other_dist/index.html'), '')
  fs.writeFileSync(path.join(destDir, 'other_dist/favicon.ico'), '')

  const read = file => {
    return fs.readFile(path.resolve(projectRoot, file), 'utf-8')
  }

  const has = file => {
    return fs.existsSync(path.resolve(projectRoot, file))
  }

  const write = (file, content) => {
    const targetPath = path.resolve(projectRoot, file)
    const dir = path.dirname(targetPath)
    return fs.ensureDir(dir).then(() => fs.writeFile(targetPath, content))
  }

  const rm = file => {
    return fs.remove(path.resolve(projectRoot, file))
  }

  const run = (command, args) => {
    // 模拟vue-cli-service build命令
    return Promise.resolve({ stdout: 'Build complete.' })
  }

  return Promise.resolve({
    dir: projectRoot,
    has,
    read,
    write,
    run,
    rm
  })
}
