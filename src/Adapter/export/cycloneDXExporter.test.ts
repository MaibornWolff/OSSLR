import { expect, assert } from 'chai';
import 'mocha';
import { stub, restore } from 'sinon';
import { CycloneDXExporter } from './cycloneDXExporter';
import { PackageInfo } from '../../Domain/model/packageInfo';

describe('exportBom', function () {
    let cycloneDXExporter: CycloneDXExporter;
    let exportJsonStub: stub;
    this.beforeEach(function () {
        cycloneDXExporter = new CycloneDXExporter();
        exportJsonStub = stub(CycloneDXExporter.prototype, 'exportJson');
        exportJsonStub.returns();
    });
    it('should pass bom to the correct exporter', function () {
        cycloneDXExporter.export(null, 'json', null);
        exportJsonStub.calledOnceWith(null, null);
    });
    it('should throw an error if the file given format is not supported', function () {
        expect(() => {
            cycloneDXExporter.export(null, 'xml', null);
        }).to.throw(Error, 'Unsupported export file format: xml');
    });
    this.afterEach(() => {
        restore();
    });
});

describe('insertCopyrightIntoBom', function () {
    let cycloneDXExporter: CycloneDXExporter;
    let originalBom: object;
    let packageInfos: PackageInfo[];
    this.beforeEach(function () {
        cycloneDXExporter = new CycloneDXExporter();
        originalBom = {
            'components': [
                {
                    'group': 'groupA',
                    'name': 'packageA',
                    'version': '2.2.0'
                },
                {
                    'group': 'groupB',
                    'name': 'packageB',
                }
            ]
        };
        packageInfos = [
            new PackageInfo('packageA', 'groupA', '2.2.0', [], [], [], '', ''),
            new PackageInfo('packageB', 'groupB', '', [], [], [],'' , 'copyright')
        ];
    });
    it('should insert the extracted copyright notices into the bom', function () {
        assert.deepEqual(cycloneDXExporter.insertCopyrightIntoBom(packageInfos, originalBom), {
            'components': [
                {
                    'group': 'groupA',
                    'name': 'packageA',
                    'version': '2.2.0'
                },
                {
                    'group': 'groupB',
                    'name': 'packageB',
                    'copyright': 'copyright'
                }
            ]
        });
    });
});