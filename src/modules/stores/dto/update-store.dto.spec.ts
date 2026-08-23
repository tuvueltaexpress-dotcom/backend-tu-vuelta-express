import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateStoreDto } from './update-store.dto';

describe('UpdateStoreDto', () => {
  const validar = (payload: Record<string, unknown>) =>
    validate(plainToInstance(UpdateStoreDto, payload), {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

  it('debería aceptar null en los horarios para poder borrarlos', async () => {
    const errores = await validar({ ha: null, hc: null });

    expect(errores).toHaveLength(0);
  });

  it('debería aceptar horarios como cadena', async () => {
    const errores = await validar({ ha: '08:00', hc: '20:00' });

    expect(errores).toHaveLength(0);
  });

  it('debería rechazar horarios que no sean cadena ni null', async () => {
    const errores = await validar({ ha: 800 });

    expect(errores).toHaveLength(1);
    expect(errores[0].property).toBe('ha');
  });
});
