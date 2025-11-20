from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates test users for all roles'

    def handle(self, *args, **kwargs):
        users_data = [
            {
                'username': 'staff1',
                'email': 'staff@example.com',
                'password': 'password123',
                'role': 'staff',
                'first_name': 'John',
                'last_name': 'Staff'
            },
            {
                'username': 'approver1',
                'email': 'approver1@example.com',
                'password': 'password123',
                'role': 'approver_level_1',
                'first_name': 'Alice',
                'last_name': 'Approver1'
            },
            {
                'username': 'approver2',
                'email': 'approver2@example.com',
                'password': 'password123',
                'role': 'approver_level_2',
                'first_name': 'Bob',
                'last_name': 'Approver2'
            },
            {
                'username': 'finance1',
                'email': 'finance@example.com',
                'password': 'password123',
                'role': 'finance',
                'first_name': 'Sarah',
                'last_name': 'Finance'
            },
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': 'admin123',
                'role': 'staff',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        ]

        for user_data in users_data:
            username = user_data['username']
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists')
                )
                continue

            is_staff = user_data.pop('is_staff', False)
            is_superuser = user_data.pop('is_superuser', False)
            password = user_data.pop('password')
            
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.is_staff = is_staff
            user.is_superuser = is_superuser
            user.save()

            self.stdout.write(
                self.style.SUCCESS(f'Successfully created user: {username} ({user.role})')
            )

        self.stdout.write(
            self.style.SUCCESS('\n=== Test Users Created ===')
        )
        self.stdout.write('Staff: staff1 / password123')
        self.stdout.write('Approver L1: approver1 / password123')
        self.stdout.write('Approver L2: approver2 / password123')
        self.stdout.write('Finance: finance1 / password123')
        self.stdout.write('Admin: admin / admin123')