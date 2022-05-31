import { expect, assert } from 'chai';
import 'mocha';
import { stub, restore } from 'sinon';
import { CycloneDXExporter } from '../../src/export/cycloneDXExporter';
import { PackageInfo } from '../../src/model/packageInfo';

describe('exportBom', function () {
    let cycloneDXExporter: CycloneDXExporter;
    let exportJsonStub: stub;
    this.beforeEach(function () {
        cycloneDXExporter = new CycloneDXExporter();
        exportJsonStub = stub(CycloneDXExporter.prototype, 'exportJson');
        exportJsonStub.returns();
    });
    it('should pass bom to the correct exporter', function () {
        cycloneDXExporter.exportBom(null, 'json', null);
        exportJsonStub.calledOnceWith(null, null);
    });
    it('should throw an error if the file given format is not supported', function () {
        expect(() => {
            cycloneDXExporter.exportBom(null, 'xml', null);
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
            {
                name: 'packageA',
                group: 'groupA',
                version: '2.2.0',
                copyright: '',
                externalReferences: [],
                licenseTexts: [],
                licenses: []
            },
            {
                name: 'packageB',
                group: 'groupB',
                version: '',
                copyright: 'copyright',
                externalReferences: [],
                licenseTexts: [],
                licenses: []
            }
        ]
    });
    it('should', function () {
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