#!/usr/bin/env npx tsx
// Verifica que la ventana de vigencia sea inclusiva en ambos extremos y que
// "hoy" se calcule en la zona de Ecuador (formato YYYY-MM-DD comparable como texto).
import assert from 'node:assert/strict'
import { announcementWindowStatus } from '@/modules/admin/announcements/window'
import { todayInEcuador } from '@/lib/today-ecuador'

const item = { isActive: true, startsAt: '2026-09-10', endsAt: '2026-09-12' }

assert.equal(announcementWindowStatus(item, '2026-09-09'), 'Programado')
assert.equal(announcementWindowStatus(item, '2026-09-10'), 'Vigente', 'el día de inicio cuenta')
assert.equal(announcementWindowStatus(item, '2026-09-11'), 'Vigente')
assert.equal(announcementWindowStatus(item, '2026-09-12'), 'Vigente', 'el día de fin cuenta')
assert.equal(announcementWindowStatus(item, '2026-09-13'), 'Expirado')
assert.equal(announcementWindowStatus({ ...item, isActive: false }, '2026-09-11'), 'Inactivo')

assert.match(todayInEcuador(), /^\d{4}-\d{2}-\d{2}$/)

console.log('✓ ventana de anuncios OK')
