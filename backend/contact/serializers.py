from rest_framework import serializers

class ContactSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=120)
    last_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=255, required=False, default="General Inquiry")
    message = serializers.CharField()