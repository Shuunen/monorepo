import { execSync } from 'node:child_process';
import { formatDate, injectMark, Logger } from '@shuunen/shuutils';
/**
 * Generate the mark to inject
 * @param root0 the options
 * @param root0.commit the commit hash to use, if empty, will use the last git commit hash
 * @param root0.date the date to use, if empty, will use the current date
 * @param root0.version the version to use, if empty, will use the version from package.json
 * @returns the mark to inject, like "4.2.0 - 123abc45 - 01/01/2021 12:00:00"
 */ export function generateMark({ commit = '', date = formatDate(new Date(), 'dd/MM/yyyy HH:mm:ss'), version = '' }) {
    let finalCommit = commit;
    /* c8 ignore next */ if (commit === '') finalCommit = execSync('git rev-parse --short HEAD', {
        cwd: process.cwd()
    }).toString().trim();
    return `${version} - ${finalCommit} - ${date}`;
}
/* c8 ignore start */ const logger = new Logger();
function injectMarkInAsset({ asset, fileName, mark, placeholder }) {
    logger.debug(`Checking ${fileName}... hasAsset: ${!!asset}, typeof source: ${typeof asset.source}, typeof code: ${typeof asset.code}`);
    const firstLine = fileName.endsWith('.html') ? '' : `/* ${placeholder} : ${mark} */\n`;
    const contentKey = fileName.endsWith('.js') ? 'code' : 'source';
    const injected = `${firstLine}${injectMark(asset[contentKey], placeholder, mark)}`;
    asset[contentKey] = injected;
    logger.debug(`Mark injected into ${fileName}`);
}
function injectMarkInAssets(assets, placeholder) {
    const mark = generateMark({});
    logger.info('Injecting unique mark into HTML, JS, and CSS files...');
    const targets = Object.keys(assets).filter((fileName)=>fileName.endsWith('.html') || fileName.endsWith('.js') || fileName.endsWith('.css'));
    for (const fileName of targets)injectMarkInAsset({
        asset: assets[fileName],
        fileName,
        mark,
        placeholder
    });
    logger.success(`Mark potentially injected into ${targets.length} files`);
}
export function uniqueMark(options = {}) {
    const placeholder = options.placeholder || 'unique-mark';
    return {
        apply: 'build',
        enforce: 'post',
        generateBundle (_, bundle) {
            injectMarkInAssets(bundle, placeholder);
        },
        name: 'vite-plugin-unique-mark'
    };
}

//# sourceMappingURL=unique-mark.node.js.map