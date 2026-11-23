// Port of legacy/backend/src/server.js (handleApi + handleTechnician) that runs in the browser on
// an in-memory copy of legacy/backend/data/db.json (seed.json). Same routes, same response shapes,
// same validation messages — so the screens ported from the prototype look and behave exactly as
// before while the real modules are being built.
//
// Differences from the prototype backend, on purpose:
//  - Sign-in is real (backend identity module); this file only serves business data.
//  - The signed-in user is matched to the sample data by e-mail / technician code.
//  - Unknown routes return null so apiFetch falls through to the real API.
//  - Data lives in memory: a page reload resets it (call resetMockDb() in tests).
//
// When an owner builds the real endpoint, delete its route here (docs/frontend-migration.md §4).
import seed from './seed.json';

let db = structuredClone(seed);

export function resetMockDb() {
  db = structuredClone(seed);
}

export function createId(prefix) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

const ok = (body) => ({ status: 200, body });
const created = (body) => ({ status: 201, body });
const fail = (status, message) => ({ status, body: { message } });

/* ---------------------------------------------------------------- helpers (unchanged) ---------- */

function servicesFromDb(data) {
  return Array.isArray(data.services) ? data.services : [];
}

function normalizeScheduleValue(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function isActiveScheduleStatus(status = '') {
  return !['đã hủy', 'hoàn tất', 'hoàn thành', 'từ chối', 'cancelled', 'completed'].includes(
    normalizeScheduleValue(status),
  );
}

function ensureTechnicianData(data) {
  data.technicians = Array.isArray(data.technicians) ? data.technicians : [];
  data.technicianJobs = Array.isArray(data.technicianJobs) ? data.technicianJobs : [];
  data.technicianLocations = Array.isArray(data.technicianLocations)
    ? data.technicianLocations
    : [];
  data.technicianReports = Array.isArray(data.technicianReports) ? data.technicianReports : [];
  return data;
}

function technicianNameById(data, technicianId) {
  return (
    ensureTechnicianData(data).technicians.find((technician) => technician.id === technicianId)
      ?.name || ''
  );
}

function bookedTechniciansAt(data, time) {
  const normalizedTime = normalizeScheduleValue(time);
  if (!normalizedTime) return [];

  const fromBookings = (Array.isArray(data.bookings) ? data.bookings : [])
    .filter(
      (booking) =>
        booking.technician &&
        normalizeScheduleValue(booking.time) === normalizedTime &&
        isActiveScheduleStatus(booking.status),
    )
    .map((booking) => booking.technician);

  const fromJobs = ensureTechnicianData(data)
    .technicianJobs.filter(
      (job) =>
        normalizeScheduleValue(job.time) === normalizedTime && isActiveScheduleStatus(job.status),
    )
    .map((job) => technicianNameById(data, job.technicianId))
    .filter(Boolean);

  return Array.from(new Set([...fromBookings, ...fromJobs]));
}

const defaultPaymentMethods = [
  {
    id: 'card',
    name: 'Thẻ Visa/Mastercard',
    detail: 'Visa - **** 2486',
    accountLabel: 'Nguyễn Minh Khang',
    accountValue: '**** 2486',
    provider: 'Visa',
    referencePrefix: 'CARD',
    fee: 0,
  },
  {
    id: 'wallet',
    name: 'Ví điện tử',
    detail: 'MoMo - 0900 000 999',
    accountLabel: 'MoMo',
    accountValue: '0900 000 999',
    provider: 'MoMo',
    referencePrefix: 'WALLET',
    fee: 2500,
  },
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    detail: 'Vietcombank - 0000 000 001',
    accountLabel: 'VCB - Nguyễn Minh Khang',
    accountValue: '0000 000 001',
    provider: 'Vietcombank',
    referencePrefix: 'BANK',
    fee: 0,
  },
  {
    id: 'cash',
    name: 'Tiền mặt sau dịch vụ',
    detail: 'Tiền mặt - Thanh toán cho kỹ thuật viên',
    accountLabel: 'Thu tại nhà',
    accountValue: 'Thanh toán cho kỹ thuật viên',
    provider: 'Tiền mặt',
    referencePrefix: 'CASH',
    fee: 0,
  },
];

function paymentMethodsForUser(data, user) {
  data.paymentMethods = Array.isArray(data.paymentMethods) ? data.paymentMethods : [];
  const existing = data.paymentMethods.filter((method) => method.userId === user.id);
  if (existing.length > 0) return existing;

  const seeded = defaultPaymentMethods.map((method) => ({
    ...method,
    userId: user.id,
    updatedAt: new Date().toISOString(),
  }));
  data.paymentMethods.push(...seeded);
  return seeded;
}

function publicTechnician(technician) {
  return {
    id: technician.id,
    code: technician.code,
    name: technician.name,
    role: technician.role,
    phone: technician.phone,
    email: technician.email,
    area: technician.area,
    experience: technician.experience,
    completedJobs: technician.completedJobs,
    certificates: technician.certificates,
    rating: technician.rating,
    reviews: technician.reviews,
  };
}

function technicianSchedule(jobs) {
  return [
    { time: '08:30', label: 'Check-in kho dụng cụ', detail: 'Nhận bộ dụng cụ và hóa chất' },
    ...jobs
      .filter((job) => String(job.time || '').startsWith('Hôm nay'))
      .map((job) => ({
        time:
          String(job.time || '')
            .split(',')
            .pop()
            ?.trim() || 'Trong ngày',
        label: `${job.id} - ${job.service}`,
        detail: job.address,
      })),
  ];
}

function technicianStats(jobs) {
  const visibleJobs = jobs.filter((job) => job.status !== 'Từ chối');
  const todayJobs = visibleJobs.filter((job) => String(job.time || '').startsWith('Hôm nay'));
  const completedJobs = jobs.filter((job) => job.status === 'Hoàn thành');
  const income = jobs
    .filter((job) =>
      ['Đã nhận', 'Đang di chuyển', 'Đang thực hiện', 'Hoàn thành'].includes(job.status),
    )
    .reduce((sum, job) => sum + Number(job.fee || 0), 0);

  return {
    assigned: visibleJobs.length,
    today: todayJobs.length,
    completed: completedJobs.length,
    income,
  };
}

/* ---------------------------------------------------------------- who is calling -------------- */

/** Maps the user signed in through the real API to the prototype's sample records. */
export function actorsFor(currentUser) {
  if (!currentUser) return null;
  const email = currentUser.email?.toLowerCase();
  const user = db.users.find((item) => email && item.email?.toLowerCase() === email) ?? {
    id: currentUser.id,
    name: currentUser.fullName,
    email: currentUser.email,
    role: 'customer',
  };
  const technician = currentUser.technicianCode
    ? (ensureTechnicianData(db).technicians.find(
        (item) =>
          item.code === currentUser.technicianCode || item.id === currentUser.technicianCode,
      ) ?? null)
    : null;
  return { user, technician };
}

function profileFor(user) {
  return (
    db.profiles.find((item) => item.id === user.id) ?? {
      id: user.id,
      name: user.name,
      phone: '',
      email: user.email,
      updatedAt: new Date().toISOString(),
    }
  );
}

/* ---------------------------------------------------------------- /technician/* --------------- */

export function handleTechnician({ method, pathname, body, technician }) {
  if (!pathname.startsWith('/technician/') || pathname === '/technician/login') return null;
  if (!technician) return fail(404, 'Không tìm thấy dữ liệu kỹ thuật viên');

  const data = ensureTechnicianData(db);
  const jobs = data.technicianJobs.filter((job) => job.technicianId === technician.id);

  if (pathname === '/technician/me' && method === 'GET') {
    return ok({ technician: publicTechnician(technician) });
  }

  if (pathname === '/technician/dashboard' && method === 'GET') {
    const latestLocation = data.technicianLocations
      .filter((item) => item.technicianId === technician.id)
      .at(-1);

    return ok({
      technician: publicTechnician(technician),
      jobs,
      schedule: technicianSchedule(jobs),
      stats: technicianStats(jobs),
      location: latestLocation || null,
      reports: data.technicianReports.filter((report) => report.technicianId === technician.id),
    });
  }

  if (pathname === '/technician/jobs' && method === 'GET') {
    return ok(jobs);
  }

  if (
    pathname.startsWith('/technician/jobs/') &&
    pathname.endsWith('/status') &&
    method === 'PUT'
  ) {
    const [, , , jobId] = pathname.split('/');
    const status = String(body.status || '').trim();
    const allowedStatuses = [
      'Chờ nhận',
      'Đã nhận',
      'Từ chối',
      'Đang di chuyển',
      'Đang thực hiện',
      'Hoàn thành',
    ];
    const job = data.technicianJobs.find(
      (item) => item.id === decodeURIComponent(jobId) && item.technicianId === technician.id,
    );

    if (!job) return fail(404, 'Không tìm thấy công việc');
    if (!allowedStatuses.includes(status)) return fail(400, 'Trạng thái công việc không hợp lệ');

    job.status = status;
    job.updatedAt = new Date().toISOString();

    const booking = data.bookings.find((item) => item.id === job.bookingId);
    if (booking) {
      booking.status = status;
      booking.technician = technician.name;
    }
    return ok(job);
  }

  if (pathname === '/technician/location' && method === 'POST') {
    const location = {
      id: createId('LOC'),
      technicianId: technician.id,
      lat: Number(body.lat),
      lng: Number(body.lng),
      accuracy: String(body.accuracy || '').trim(),
      jobId: String(body.jobId || '').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
      return fail(400, 'Tọa độ vị trí không hợp lệ');
    }

    data.technicianLocations.push(location);
    return created(location);
  }

  if (
    pathname.startsWith('/technician/jobs/') &&
    pathname.endsWith('/report') &&
    method === 'POST'
  ) {
    const [, , , jobId] = pathname.split('/');
    const job = data.technicianJobs.find(
      (item) => item.id === decodeURIComponent(jobId) && item.technicianId === technician.id,
    );
    if (!job) return fail(404, 'Không tìm thấy công việc');

    const report = {
      id: createId('RPT'),
      technicianId: technician.id,
      jobId: job.id,
      beforePhoto: String(body.beforePhoto || ''),
      afterPhoto: String(body.afterPhoto || ''),
      note: String(body.note || '').trim(),
      completedAt: new Date().toISOString(),
    };

    if (!report.beforePhoto || !report.afterPhoto) {
      return fail(400, 'Cần ảnh trước và ảnh sau để hoàn thành công việc');
    }

    data.technicianReports.push(report);
    job.status = 'Hoàn thành';
    job.reportId = report.id;
    job.reportNote = report.note;
    job.completedAt = report.completedAt;
    job.updatedAt = report.completedAt;

    const booking = data.bookings.find((item) => item.id === job.bookingId);
    if (booking) {
      booking.status = 'Hoàn thành';
      booking.technician = technician.name;
    }
    return created({ report, job });
  }

  return null;
}

/* ---------------------------------------------------------------- customer routes ------------- */

export function handleApi({ method, pathname, searchParams, body, user }) {
  db.reminders = Array.isArray(db.reminders) ? db.reminders : [];
  const userBookings = db.bookings.filter((booking) => booking.userId === user.id);
  const userPayments = db.payments.filter((payment) => payment.userId === user.id);
  const userDevices = db.devices.filter((device) => device.userId === user.id);
  const userAlerts = db.alerts.filter((alert) => alert.userId === user.id);
  const userReminders = db.reminders.filter((reminder) => reminder.userId === user.id);

  if (pathname === '/dashboard' && method === 'GET') {
    const assignedBooking = userBookings.find((booking) => booking.technician);
    return ok({
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' },
      profile: profileFor(user),
      devices: userDevices,
      bookings: userBookings.slice(-6).reverse(),
      payments: userPayments.slice(-6).reverse(),
      alerts: userAlerts,
      reminders: userReminders,
      technician: assignedBooking
        ? {
            name: assignedBooking.technician,
            status: assignedBooking.status,
            job: assignedBooking.service,
          }
        : null,
    });
  }

  if (pathname === '/services' && method === 'GET') {
    const domain = searchParams.get('domain');
    const services = servicesFromDb(db);
    return ok(domain ? services.filter((service) => service.domain === domain) : services);
  }

  if (pathname === '/booking-options' && method === 'GET') return ok(db.bookingOptions);

  if (pathname === '/technicians' && method === 'GET') {
    const domain = searchParams.get('domain');
    const technicians = Array.isArray(db.bookingOptions.technicians)
      ? db.bookingOptions.technicians
      : [];
    return ok(
      domain
        ? technicians.filter((technician) => technician.domains?.includes(domain))
        : technicians,
    );
  }

  if (pathname === '/payment-gateways' && method === 'GET') return ok(db.paymentGateways);
  if (pathname === '/profile-options' && method === 'GET') return ok(db.profileOptions);
  if (pathname === '/repair-options' && method === 'GET') return ok(db.repairOptions);

  if (pathname === '/technician-availability' && method === 'GET') {
    const time = searchParams.get('time') || '';
    return ok({ time, bookedTechnicians: bookedTechniciansAt(db, time) });
  }

  if (pathname === '/devices' && method === 'GET') return ok(userDevices);

  if (pathname === '/devices' && method === 'POST') {
    const device = {
      id: createId('DV'),
      userId: user.id,
      name: String(body.name || '').trim(),
      type: String(body.type || 'Thiết bị').trim(),
      room: String(body.room || '').trim(),
      brand: String(body.brand || '').trim(),
      status: String(body.status || 'Đang hoạt động').trim(),
      health: Math.min(Math.max(Number(body.health || 85), 0), 100),
      energy: String(body.energy || 'Ổn định').trim(),
      nextService: String(body.nextService || 'Theo lịch định kỳ').trim(),
      lastService: String(body.lastService || 'Chưa có').trim(),
      warranty: String(body.warranty || 'Chưa cập nhật').trim(),
      tone: String(body.tone || 'emerald').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!device.name || !device.room || !device.brand) {
      return fail(400, 'Tên thiết bị, phòng và thương hiệu là bắt buộc');
    }
    db.devices.push(device);
    return created(device);
  }

  if (pathname.startsWith('/devices/') && method === 'PUT') {
    const deviceId = decodeURIComponent(pathname.split('/').pop() || '');
    const device = db.devices.find((item) => item.id === deviceId && item.userId === user.id);
    if (!device) return fail(404, 'Không tìm thấy thiết bị');

    device.name = String(body.name || device.name || '').trim();
    device.type = String(body.type || device.type || 'Thiết bị').trim();
    device.room = String(body.room || device.room || '').trim();
    device.brand = String(body.brand || device.brand || '').trim();
    device.status = String(body.status || device.status || 'Đang hoạt động').trim();
    device.health = Math.min(Math.max(Number(body.health ?? device.health ?? 85), 0), 100);
    device.energy = String(body.energy || device.energy || 'Ổn định').trim();
    device.nextService = String(
      body.nextService || device.nextService || 'Theo lịch định kỳ',
    ).trim();
    device.lastService = String(body.lastService || device.lastService || 'Chưa có').trim();
    device.warranty = String(body.warranty || device.warranty || 'Chưa cập nhật').trim();
    device.tone = String(body.tone || device.tone || 'emerald').trim();
    device.updatedAt = new Date().toISOString();

    if (!device.name || !device.room || !device.brand) {
      return fail(400, 'Tên thiết bị, phòng và thương hiệu là bắt buộc');
    }
    return ok(device);
  }

  if (pathname === '/reminders' && method === 'GET') return ok(userReminders);

  if (pathname === '/reminders' && method === 'POST') {
    const device = db.devices.find((item) => item.id === body.deviceId && item.userId === user.id);
    const reminder = {
      id: createId('RM'),
      userId: user.id,
      deviceId: String(body.deviceId || device?.id || '').trim(),
      deviceName: String(body.deviceName || device?.name || 'Thiết bị').trim(),
      title: String(body.title || '').trim(),
      type: String(body.type || 'Bảo trì').trim(),
      domain: String(body.domain || 'Appliance').trim(),
      dueDate: String(body.dueDate || '').trim(),
      note: String(body.note || '').trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!reminder.title || !reminder.dueDate) {
      return fail(400, 'Tên nhắc việc và ngày thực hiện là bắt buộc');
    }
    db.reminders.push(reminder);
    return created(reminder);
  }

  if (pathname.startsWith('/reminders/') && method === 'PUT') {
    const reminderId = decodeURIComponent(pathname.split('/').pop() || '');
    const reminder = db.reminders.find((item) => item.id === reminderId && item.userId === user.id);
    if (!reminder) return fail(404, 'Không tìm thấy nhắc việc');

    reminder.status = String(body.status || reminder.status).trim();
    reminder.bookingId = body.bookingId ? String(body.bookingId).trim() : reminder.bookingId;
    reminder.completedAt =
      reminder.status === 'done' ? new Date().toISOString() : reminder.completedAt;
    reminder.updatedAt = new Date().toISOString();
    return ok(reminder);
  }

  if (pathname === '/bookings' && method === 'GET') return ok(userBookings);

  if (pathname === '/bookings' && method === 'POST') {
    const booking = {
      id: createId('BK'),
      userId: user.id,
      service: String(body.service || '').trim(),
      domain: String(body.domain || 'Booking').trim(),
      time: String(body.time || '').trim(),
      status:
        body.source === 'reminder' ? 'Chờ kỹ thuật viên tiếp nhận' : 'Chờ xác nhận thanh toán',
      technician: String(body.technician || '').trim(),
      amount: Number(body.amount || 0),
      address: String(body.address || '').trim(),
      note: String(body.note || '').trim(),
      voucher: String(body.voucher || '').trim(),
      addOns: Array.isArray(body.addOns) ? body.addOns : [],
      source: String(body.source || 'booking').trim(),
      reminderId: body.reminderId ? String(body.reminderId).trim() : undefined,
      deviceId: body.deviceId ? String(body.deviceId).trim() : undefined,
      deviceName: body.deviceName ? String(body.deviceName).trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    if (!booking.service || !booking.time || !booking.address) {
      return fail(400, 'Dịch vụ, thời gian và địa chỉ là bắt buộc');
    }
    if (booking.technician && bookedTechniciansAt(db, booking.time).includes(booking.technician)) {
      return fail(
        409,
        `${booking.technician} đã có lịch trong khung giờ ${booking.time}. Vui lòng chọn kỹ thuật viên hoặc giờ khác.`,
      );
    }

    db.bookings.push(booking);
    if (booking.reminderId) {
      const reminder = db.reminders.find(
        (item) => item.id === booking.reminderId && item.userId === user.id,
      );
      if (reminder) {
        reminder.status = 'scheduled';
        reminder.bookingId = booking.id;
        reminder.updatedAt = booking.createdAt;
      }
    }
    return created(booking);
  }

  if (pathname === '/payments' && method === 'GET') return ok(userPayments);

  if (pathname === '/payment-methods' && method === 'GET')
    return ok(paymentMethodsForUser(db, user));

  if (pathname.startsWith('/payment-methods/') && method === 'PUT') {
    const methodId = decodeURIComponent(pathname.split('/').pop() || '');
    const paymentMethod = paymentMethodsForUser(db, user).find((item) => item.id === methodId);
    if (!paymentMethod) return fail(404, 'Không tìm thấy phương thức thanh toán');

    paymentMethod.provider = String(body.provider || paymentMethod.provider).trim();
    paymentMethod.accountValue = String(body.accountValue || paymentMethod.accountValue).trim();
    paymentMethod.accountLabel = String(body.accountLabel || paymentMethod.accountLabel).trim();
    paymentMethod.fee = Number(body.fee ?? paymentMethod.fee);
    paymentMethod.detail = `${paymentMethod.provider} - ${paymentMethod.accountValue}`;
    paymentMethod.updatedAt = new Date().toISOString();
    return ok(paymentMethod);
  }

  if (pathname === '/payments' && method === 'POST') {
    const payment = {
      id: createId('TXN'),
      userId: user.id,
      bookingId: String(body.bookingId || '').trim(),
      service: String(body.service || '').trim(),
      method: String(body.method || '').trim(),
      methodDetail: String(body.methodDetail || '').trim(),
      gateway: String(body.gateway || '').trim(),
      gatewayRef: String(body.gatewayRef || '').trim(),
      amount: Number(body.amount || 0),
      status: 'Thành công',
      createdAt: new Date().toISOString(),
    };

    if (!payment.service || !payment.method || payment.amount <= 0) {
      return fail(400, 'Dịch vụ, phương thức và số tiền là bắt buộc');
    }

    db.payments.push(payment);
    const booking = db.bookings.find(
      (item) => item.id === payment.bookingId && item.userId === user.id,
    );
    if (booking) {
      booking.status = 'Đã thanh toán';
      booking.paymentId = payment.id;
      booking.paidAt = payment.createdAt;
    }
    return created(payment);
  }

  if (pathname === '/profile' && method === 'GET') return ok(profileFor(user));

  if (pathname === '/profile' && method === 'PUT') {
    const latest = profileFor(user);
    const profile = {
      ...latest,
      name: String(body.name || latest.name || '').trim(),
      phone: String(body.phone || latest.phone || '').trim(),
      email: String(body.email || latest.email || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    db.profiles = db.profiles.filter((item) => item.id !== profile.id);
    db.profiles.push(profile);
    return ok(profile);
  }

  return null;
}
