#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py shell -c "
from api.models import User
users = [
    ('staff1', 's@t.com', 'password123', 'staff'),
    ('approver1', 'a1@t.com', 'password123', 'approver_level_1'),
    ('approver2', 'a2@t.com', 'password123', 'approver_level_2'),
    ('finance1', 'f@t.com', 'password123', 'finance'),
]
for u, e, p, r in users:
    user, created = User.objects.get_or_create(username=u, defaults={'email': e, 'role': r})
    if created:
        user.set_password(p)
        user.save()
        print(f'Created {u}')
" || true
