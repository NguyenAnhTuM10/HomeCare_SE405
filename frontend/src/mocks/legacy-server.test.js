import { beforeEach, describe, expect, it } from 'vitest';
import { mockFetch } from './index';
import { resetMockDb } from './legacy-server';
import seed from './seed.json';

// Users as the real API returns them after sign-in
const khang = {
  id: 'uuid-khang',
  email: 'khang.nguyen@example.com',
  fullName: 'Nguyễn Minh Khang',
  role: 'CUSTOMER',
  technicianCode: null,
};
const linh = {
  id: 'uuid-linh',
  email: 'linh.tran@example.com',
  fullName: 'Trần Hà Linh',
  role: 'CUSTOMER',
  technicianCode: null,
};
const viet = {
  id: 'uuid-viet',
  email: 'viet.technician@homecare.test',
  fullName: 'Phạm Quốc Việt',
  role: 'TECHNICIAN',
  technicianCode: 'TECH-088',
};

const call = async (user, path, init) => {
  const res = await mockFetch(path, init, user);
  return res && { status: res.status, body: await res.json() };
};

describe('mock API (port of the prototype backend)', () => {
  beforeEach(() => resetMockDb());

  it('serves the signed-in customer their own sample data, as the prototype did', async () => {
    const { status, body } = await call(khang, '/dashboard');
    expect(status).toBe(200);
    const expectedDevices = seed.devices.filter((d) => d.userId === 'USR-SAMPLE-001');
    expect(body.devices).toEqual(expectedDevices);
    expect(body.bookings.every((b) => b.userId === 'USR-SAMPLE-001')).toBe(true);
  });

  it('never leaks another customer’s bookings', async () => {
    const { body } = await call(linh, '/bookings');
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((b) => b.userId === 'USR-SAMPLE-002')).toBe(true);
  });

  it('keeps writes in memory so multi-screen flows work (booking -> payment)', async () => {
    const created = await call(khang, '/bookings', {
      method: 'POST',
      body: JSON.stringify({
        service: 'Vệ sinh máy lạnh',
        time: 'Thứ 2, 08:00',
        address: '12 Nguyễn Văn Linh',
        amount: 200000,
      }),
    });
    expect(created.status).toBe(201);
    const paid = await call(khang, '/payments', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: created.body.id,
        service: 'Vệ sinh máy lạnh',
        method: 'VNPay',
        amount: 200000,
      }),
    });
    expect(paid.status).toBe(201);
    const { body: bookings } = await call(khang, '/bookings');
    expect(bookings.find((b) => b.id === created.body.id).status).toBe('Đã thanh toán');
  });

  it('returns the prototype validation messages', async () => {
    const res = await call(khang, '/bookings', { method: 'POST', body: '{}' });
    expect(res).toEqual({
      status: 400,
      body: { message: 'Dịch vụ, thời gian và địa chỉ là bắt buộc' },
    });
  });

  it('serves the technician portal by technician code', async () => {
    const { status, body } = await call(viet, '/technician/dashboard');
    expect(status).toBe(200);
    expect(body.technician.code).toBe('TECH-088');
    expect(body.jobs.length).toBe(
      seed.technicianJobs.filter((j) => j.technicianId === 'TECH-088').length,
    );
  });

  it('leaves unknown routes and signed-out calls to the real API', async () => {
    expect(await mockFetch('/auth/me', {}, khang)).toBeNull();
    expect(await mockFetch('/admin/users', {}, khang)).toBeNull();
    expect(await mockFetch('/dashboard', {}, null)).toBeNull();
  });
});
