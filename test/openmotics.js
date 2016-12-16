import OpenMotics from '../src/openmotics.js';
import { expect } from 'chai'

describe('OpenMotics', () => {
  const api = OpenMotics({
    username: process.env.OPENMOTICS_USERNAME,
    password: process.env.OPENMOTICS_PASSWORD,
    hostname: process.env.OPENMOTICS_HOSTNAME,
    port: process.env.OPENMOTICS_PORT,
  });

  it('Can get version', () => {
    return api.getVersion().then((res) => {
      expect(res['success']).to.be.true;
      expect(res['version']).to.equal('1.6.4');
    });
  });

  it('Can get output status', () => {
    return api.getOutputStatus().then((res) => {
      expect(res['success']).to.be.true;
      expect(res['status']).to.be.array;
      expect(res['status'][0]['id']).to.exist;
      expect(res['status'][0]['dimmer']).to.exist;
      expect(res['status'][0]['ctimer']).to.exist;
      expect(res['status'][0]['status']).to.exist;
    });
  });
});
