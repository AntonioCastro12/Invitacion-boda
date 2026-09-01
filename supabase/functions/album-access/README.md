# album-access

Función pública controlada que valida `eventoSlug + codigoInvitado` antes de emitir URLs de lectura o subida con vigencia limitada. Debe desplegarse sin validación JWT porque los invitados no crean una cuenta; el código individual funciona como credencial del evento.
